import asyncio
import os
import sys
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.profile_ingest.linkedin_scraper import LinkedInScraper

load_dotenv()

async def main():
    scraper = LinkedInScraper()
    print("Testing Stealth Mode (Headless)...")
    try:
        # headless=True is default
        text = await scraper.scrape_profile("https://www.linkedin.com/in/williamhgates")
        print("SUCCESS: Scraped profile in headless mode!")
        print(f"Length: {len(text)}")
    except Exception as e:
        print(f"FAILURE: {e}")

if __name__ == "__main__":
    asyncio.run(main())
