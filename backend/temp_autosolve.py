
    async def _attempt_auto_solve(self, page: Page):
        """Attempts to auto-click the captcha checkbox and use Buster."""
        logger.info("Attempting to auto-solve Captcha...")
        try:
            # 1. Find the ReCaptcha iframe
            try:
                await page.wait_for_selector("iframe[src*='recaptcha']", timeout=5000)
            except:
                logger.info("No reCAPTCHA frame found immediately.")
                return

            # Get the anchor frame (the checkbox)
            frames = page.frames
            anchor_frame = None
            for f in frames:
                if "api2/anchor" in f.url:
                    anchor_frame = f
                    break
            
            if anchor_frame:
                logger.info("Found ReCaptcha anchor frame.")
                checkbox = anchor_frame.locator(".recaptcha-checkbox-border")
                if await checkbox.is_visible():
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
            
            # Check for Challenge Frame (Images)
            frames = page.frames
            bframe = None
            for f in frames:
                if "api2/bframe" in f.url:
                    bframe = f
                    break
            
            if bframe:
                logger.info("Challenge image frame detected. Looking for Buster icon...")
                solver_button = bframe.locator("#solver-button")
                try:
                    await solver_button.wait_for(timeout=5000)
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
                         await self._human_delay(3000, 5000)
                except:
                    logger.warning("Buster button not found inside frame.")

        except Exception as e:
            logger.warning(f"Auto-solve attempt failed: {e}")
