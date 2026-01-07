from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from app.profile_ingest.schemas import ProfileParseResponse, ProfileSummarizeRequest, ProfileSummarizeResponse, ProfileParseRequest
from app.profile_ingest.linkedin_parser import parse_linkedin_pdf, clean_profile_text
from app.profile_ingest.profile_summarizer import summarize_profile
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

from app.profile_ingest.url_parser import fetch_url_content
from app.profile_ingest.linkedin_service import LinkedInScraper

@router.post("/ingest", response_model=ProfileParseResponse)
@router.post("/ingest", response_model=ProfileParseResponse)
async def ingest_profile_content(
    file: UploadFile = File(None),
    linkedin_url: str = Body(None),
    github_url: str = Body(None),
    portfolio_url: str = Body(None),
    profile_text: str = Body(None)
):
    """
    Unified Ingest Endpoint - Multi-Source Aggregation.
    Combines insights from:
    - LinkedIn PDF (High fidelity)
    - GitHub URL (Technical)
    - Portfolio URL (Creative/Personal)
    """
    try:
        combined_text = []
        sources = []
        
        # 1. Process PDF (Highest Priority for core data)
        if file:
            logger.info(f"Processing PDF upload: {file.filename}")
            pdf_text = await parse_linkedin_pdf(file)
            if pdf_text:
                combined_text.append(f"--- SOURCE: LINKEDIN PDF ---\n{pdf_text}")
                sources.append("linkedin_pdf")

        # 1.5 Process LinkedIn URL (Scraper)
        if linkedin_url:
            logger.info(f"Processing LinkedIn URL: {linkedin_url}")
            try:
                scraper = LinkedInScraper()
                # Run scraper (handles session & headless logic internally)
                linkedin_text = await scraper.scrape_profile(linkedin_url)
                if linkedin_text:
                    combined_text.append(f"--- SOURCE: LINKEDIN SCRAPER ---\n{linkedin_text}")
                    sources.append("linkedin_scraper")
            except Exception as e:
                logger.error(f"Failed to scrape LinkedIn profile: {e}")
                # Don't fail the whole request, just log it. 
                # Ideally might want to return a partial error warning but standard practice 
                # for multi-source is best effort.

        # 2. Process GitHub
        if github_url:
            logger.info(f"Processing GitHub: {github_url}")
            try:
                gh_result = fetch_url_content(github_url)
                if gh_result["raw_profile_text"] != "AUTH_WALL_DETECTED":
                    combined_text.append(f"--- SOURCE: GITHUB ---\n{gh_result['raw_profile_text']}")
                    sources.append("github")
            except Exception as e:
                logger.warning(f"Failed to fetch {github_url}: {e}")

        # 3. Process Portfolio
        if portfolio_url:
            logger.info(f"Processing Portfolio: {portfolio_url}")
            try:
                port_result = fetch_url_content(portfolio_url)
                if port_result["raw_profile_text"] != "AUTH_WALL_DETECTED":
                    combined_text.append(f"--- SOURCE: PORTFOLIO ---\n{port_result['raw_profile_text']}")
                    sources.append("portfolio")
            except Exception as e:
                logger.warning(f"Failed to fetch {portfolio_url}: {e}")

        # 4. Manual Text Fallback
        if profile_text:
             logger.info("Processing raw profile text input")
             text = clean_profile_text(profile_text)
             combined_text.append(f"--- SOURCE: MANUAL TEXT ---\n{text}")
             sources.append("manual_text")
             
        # Check if we got ANYTHING
        if not combined_text:
             raise HTTPException(status_code=400, detail="No valid content found. Please provide at least one accessible source.")
             
        final_text = "\n\n".join(combined_text)
             
        return ProfileParseResponse(
            status="success",
            raw_profile_text=final_text,
            source=", ".join(sources),
            char_count=len(final_text)
        )
        
    except Exception as e:
        logger.error(f"Ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize", response_model=ProfileSummarizeResponse)
async def summarize_profile_content(request: ProfileSummarizeRequest):
    """
    Summarize raw profile text into manifestation data.
    """
    try:
        logger.info(f"Summarizing profile text ({len(request.raw_profile_text)} chars)")
        manifestation_data = summarize_profile(request.raw_profile_text)
        
        return ProfileSummarizeResponse(
            status="success",
            manifestation_data=manifestation_data
        )
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
