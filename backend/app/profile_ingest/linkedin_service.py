import os
import json
import random
import asyncio
import logging
from typing import Optional
from playwright.async_api import async_playwright, Page, TimeoutError
from playwright_stealth import Stealth

logger = logging.getLogger(__name__)

SESSION_FILE = "session.json"

class LinkedInScraper:
    def __init__(self):
        self.username = os.getenv("LINKEDIN_USERNAME")
        self.password = os.getenv("LINKEDIN_PASSWORD")
        if not self.username or not self.password:
            logger.warning("LinkedIn credentials missing.")

    async def _human_delay(self, min_ms=500, max_ms=2000):
        """Waits for a random amount of time to mimic human behavior."""
        await asyncio.sleep(random.randint(min_ms, max_ms) / 1000)

    async def _perform_login(self, page: Page):
        """
        Handles the login process, including credential entry and waiting for manual challenge solving.
        """
        logger.info("Starting login sequence...")
        
        # Navigate to login if not there
        if "login" not in page.url:
            await page.goto("https://www.linkedin.com/login", timeout=30000)
            await self._human_delay(1000, 3000)

        # Check if already logged in (redirected)
        if "feed" in page.url or "in/" in page.url:
             return

        # Type Credentials
        logger.info("Entering credentials...")
        await page.fill("#username", self.username)
        await self._human_delay(300, 1200)
        await page.fill("#password", self.password)
        await self._human_delay(500, 1500)
        
        logger.info("Clicking sign in...")
        await page.click("button[type='submit']")
        
        # Smart Wait for Navigation
        try:
            # Wait for either feed (success) or challenge (security)
            # We wait a bit to see where we land
            await page.wait_for_load_state("networkidle", timeout=10000)
            await self._human_delay(1000, 2000)
        except:
             pass

        # Check for Security Challenge
        content = await page.content()
        if "challenge" in page.url or "security check" in content.lower() or "checkpoint" in page.url:
            logger.warning("Security Challenge Detected!")
            
            # Attempt Auto-Solve
            await self._attempt_auto_solve(page)
            
            logger.info("Waiting up to 120 seconds in case manual solution is still needed...")
            
            try:
                # Wait until we see 'feed' or 'in/' which means success
                # Using a loop to check url periodically is sometimes safer than wait_for_url with globs
                for _ in range(60): # 60 * 2s = 120s
                    if "feed" in page.url or "/in/" in page.url:
                        logger.info("Challenge Solved! Proceeding.")
                        return
                    await asyncio.sleep(2)
                
                raise Exception("Security Challenge timed out. Please solve faster next time.")
            except Exception as e:
                raise e
        
        # Final check
        if "login" in page.url:
             raise Exception("Login failed. possibly bad credentials or unhandled error.")

    async def _attempt_auto_solve(self, page: Page):
        """Attempts to auto-click the captcha checkbox and use Buster."""
        logger.info("Attempting to auto-solve Captcha...")
        try:
            # 1. Find the ReCaptcha iframe
            try:
                await page.wait_for_selector("iframe[src*='recaptcha']", timeout=5000)
            except:
                logger.info("No reCAPTCHA frame found immediately.")
                logger.info("No reCAPTCHA frame found immediately.")
                # return (removed to allow deep scan)

            # Search ALL frames for the checkbox (more robust)
            checkbox = None
            found_frame = None
            
            for f in page.frames:
                try:
                    # Try validation selectors
                    cb = f.locator(".recaptcha-checkbox-border, #recaptcha-anchor")
                    if await cb.count() > 0 and await cb.is_visible():
                        checkbox = cb
                        found_frame = f
                        logger.info(f"Found checkbox in frame: {f.url}")
                        break
                except:
                    continue
            
            if checkbox:
                logger.info("Found ReCaptcha checkbox. Initiating click...")
                # Human-like mouse movement
                box = await checkbox.bounding_box()
                if box:
                    # Add some randomness to the click position
                    x = box["x"] + random.randint(5, int(box["width"]) - 5)
                    y = box["y"] + random.randint(5, int(box["height"]) - 5)
                    
                    await page.mouse.move(x, y, steps=25)
                    await self._human_delay(200, 600)
                    await page.mouse.down()
                    await self._human_delay(50, 150)
                    await page.mouse.up()
                    logger.info("Clicked 'I'm not a robot' checkbox.")
                    
                    await self._human_delay(2000, 4000)
            else:
                logger.warning("Could not find reCAPTCHA checkbox in any frame.")
            
            # Check for Challenge Frame (Images) - Poll for it
            bframe = None
            logger.info("Waiting for image challenge to appear...")
            for _ in range(20): # Poll for 10 seconds
                for f in page.frames:
                    if "api2/bframe" in f.url:
                        bframe = f
                        break
                if bframe:
                    break
                await asyncio.sleep(0.5)
            
            if bframe:
                logger.info("Challenge image frame detected. Looking for Buster icon...")
                try:
                    # Buster button takes a moment to inject
                    solver_button = bframe.locator("#solver-button")
                    await solver_button.wait_for(state="attached", timeout=5000)
                    
                    if await solver_button.is_visible():
                         # Human-like move to solver
                         box = await solver_button.bounding_box()
                         if box:
                            x = box["x"] + random.randint(5, int(box["width"]) - 5)
                            y = box["y"] + random.randint(5, int(box["height"]) - 5)
                            await page.mouse.move(x, y, steps=20)
                            await self._human_delay(200, 500)
                            
                         await solver_button.click()
                         logger.info("Clicked Buster AI Solver button!")
                         # Wait for Buster to solve it
                         await self._human_delay(3000, 6000)
                    else:
                         logger.warning("Buster button attached but not visible.")
                except Exception as e:
                    logger.warning(f"Buster button not found or clickable: {e}")
            else:
                 logger.info("No image challenge appeared (maybe checkbox click was enough?)")

        except Exception as e:
            logger.warning(f"Auto-solve attempt failed: {e}")

    async def _dismiss_modals(self, page: Page):
        """Dismisses any blocking modals (like 'Sign in to view full profile')."""
        logger.info("Checking for blocking modals...")
        try:
            # Common selectors for LinkedIn modal close buttons
            close_selectors = [
                 "button[aria-label='Dismiss']",
                 "button.modal__dismiss",
                 "button[data-test-modal-close-btn]",
                 "div[role='dialog'] button[aria-label='Close']",
                 "svg[data-test-icon='close-small']" # Sometimes it's just an icon click
            ]
            
            for selector in close_selectors:
                if await page.locator(selector).count() > 0:
                     if await page.locator(selector).first.is_visible():
                         logger.info(f"Found modal close button ({selector}). Clicking...")
                         await page.locator(selector).first.click()
                         await self._human_delay(500, 1000)
                         return
            
            # Contextual: sometimes clicking the background works
            # await page.mouse.click(10, 10) 
            
        except Exception as e:
            logger.warning(f"Error dismissing modal: {e}")

    async def _extract_main_content(self, page: Page) -> str:
        """
        Extracts relevant profile text.
        """
        # Dimiss any authwall modals first
        await self._dismiss_modals(page)

        extracted_data = []
        
        # Scroll to load everything
        logger.info("Scrolling profile...")
        for i in range(5):
             await page.mouse.wheel(0, random.randint(300, 800))
             await self._human_delay(500, 1500)
        
        # Try to extract the main profile sections
        # Name, Headline, About, Experience
        try:
            # Get the whole text for robustness
            body_text = await page.evaluate("document.body.innerText")
            extracted_data.append(body_text)
        except Exception as e:
             logger.error(f"Error extracting text: {e}")
        
        return "\n".join(extracted_data)


    async def scrape_profile(self, profile_url: str, headless: bool = True) -> Optional[str]:
        """
        Orchestrates scraping with session persistence and stealth.
        """
        # 1. Session Logic: If no session, force visible to create one
        # 1. Session Logic: If no session, we try to run headlessly now too!
        if not os.path.exists(SESSION_FILE):
             logger.info("No session file found. Attempting initial login in HEADLESS mode (Background).")
             # headless = False  <-- Removed to respect background request

        async with async_playwright() as p:
            # 3. Launch Persistent Context (Required for Extensions)
            user_data_dir = os.path.join(os.getcwd(), "user_data")
            extension_path = os.path.join(os.getcwd(), "extensions/buster")
            
            args = [
                f"--disable-extensions-except={extension_path}",
                f"--load-extension={extension_path}",
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-infobars",
                "--window-position=0,0",
                "--ignore-certificate-errors",
                "--disable-dev-shm-usage",
                "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            ]
            
            # Use new Headless mode if requested (supports extensions!)
            if headless:
                args.append("--headless=new")

            context = await p.chromium.launch_persistent_context(
                user_data_dir,
                headless=False, # Extensions strictly require visible mode (usually)
                args=args,
                viewport={'width': 1280 + random.randint(0, 50), 'height': 800 + random.randint(0, 50)},
                locale='en-US',
                timezone_id='America/New_York',
                user_agent='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            )

            # 4. Apply Stealth Scripts
            if len(context.pages) > 0:
                page = context.pages[0]
            else:
                page = await context.new_page()

            await context.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
            
            # Playwright Stealth Plugin
            stealth = Stealth()
            await stealth.apply_stealth_async(page)
            
            try:
                # 5. Navigate to Profile (or Login)
                logger.info(f"Navigating to {profile_url}")
                await page.goto(profile_url, timeout=60000)
                await self._human_delay(2000, 4000)

                # 6. Check for Auth Wall / Redirect
                # If we were redirected to authwall, login page, or checkpoint
                url = page.url
                if "login" in url or "authwall" in url or "checkpoint" in url or "challenge" in url:
                    logger.info("Session invalid or expired. Performing login...")
                    if headless:
                         # Attempt to save the day? No, usually safer to ask for visible.
                         # But let's try to pass if it's just a simple redirect
                         pass
                    
                    await self._perform_login(page)
                    
                    # Once logged in, navigate back to profile if we aren't there
                    if profile_url not in page.url:
                         await page.goto(profile_url)
                         await self._human_delay(2000, 4000)

                # 7. Update Session
                # Save the fresh cookies for next time
                storage = await context.storage_state()
                with open(SESSION_FILE, 'w') as f:
                    json.dump(storage, f)
                logger.info("Session updated and saved to disk.")

                # 8. Extract
                text = await self._extract_main_content(page)
                
                # Debug Save
                try:
                    os.makedirs("outputs", exist_ok=True)
                    with open("outputs/last_linkedin_scrape.txt", "w", encoding="utf-8") as f:
                        f.write(text)
                except Exception as e:
                    logger.warning(f"Failed to save debug crawl file: {e}")
                    
                return text

            except Exception as e:
                logger.error(f"Scraping failed: {e}")
                try:
                    # page object might be different in persistent context if we accessed pages[0]
                    pages = context.pages
                    if pages: await pages[0].screenshot(path="error.png")
                except: pass
                raise e
            finally:
                await context.close()
