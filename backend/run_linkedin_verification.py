import asyncio
import os
import sys
from dotenv import load_dotenv

# Add the backend directory to sys.path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.profile_ingest.linkedin_scraper import LinkedInScraper

# Load environment variables
load_dotenv()

async def main():
    try:
        print("Initializing Scraper...")
        scraper = LinkedInScraper()
        
        # Check if credentials are loaded (without printing them)
        if scraper.username and scraper.password:
            print("Credentials found in environment.")
        else:
            print("ERROR: Credentials NOT found in environment.")
            return

        # Use a well-known public profile (Bill Gates) for testing
        test_url = "https://www.linkedin.com/in/williamhgates"
        print(f"Attempting to scrape: {test_url}")
        
        # Run in visible mode to allow captcha solving
        text = await scraper.scrape_profile(test_url, headless=False)
        
        print("\n--- Scraping Successful! ---")
        print(f"Extracted {len(text)} characters.")
        print("--- Preview ---")
        print(text[:500] + "...")
        
    except Exception as e:
        print(f"\nERROR: Scraping failed. Details: {e}")

if __name__ == "__main__":
    asyncio.run(main())
