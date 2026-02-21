import requests
from bs4 import BeautifulSoup
import re

def scrape_fandom_wiki(url: str):
    """
    Scrapes text content from a Fandom.com wiki page.
    Note: Highly restrictive, might return 403.
    """
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        content_div = soup.find('div', {'class': 'mw-parser-output'})
        if not content_div: return "Could not find content."
        for element in content_div.find_all(['script', 'style', 'table', 'aside']):
            element.decompose()
        text = content_div.get_text(separator='\n')
        text = re.sub(r'\[\d+\]', '', text)
        return re.sub(r'\n\s*\n+', '\n\n', text).strip()
    except Exception as e:
        return f"Fandom Error: {str(e)}"

def get_gutenberg_book(book_id: str):
    """
    Downloads a plain text book from Project Gutenberg.
    Extremely reliable and bot-friendly.
    """
    url = f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt"
    print(f"--- Fetching Gutenberg Book ID: {book_id} ---")
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        text = response.text
        
        # Strip header/footer to save tokens
        start_marker = "*** START OF THE PROJECT GUTENBERG EBOOK"
        end_marker = "*** END OF THE PROJECT GUTENBERG EBOOK"
        
        start_pos = text.find(start_marker)
        end_pos = text.find(end_marker)
        
        if start_pos != -1:
            # Move to end of that line
            start_pos = text.find("\n", start_pos) + 1
            
        if start_pos != -1 and end_pos != -1:
            text = text[start_pos:end_pos]
            
        return text.strip()
    except Exception as e:
        return f"Gutenberg Error: {str(e)}"

if __name__ == "__main__":
    # Test with Dracula (ID: 345)
    book_text = get_gutenberg_book("345")
    if not book_text.startswith("Gutenberg Error"):
        print(f"Success! Character count: {len(book_text)}")
        print("\nFirst 500 characters of the story:")
        print(book_text[:500] + "...")
        
        with open("book_lore.txt", "w", encoding="utf-8") as f:
            f.write(book_text)
        print("\n✅ Saved to book_lore.txt")
