import os
import requests
import zipfile
import io

EXTENSION_URL = "https://github.com/dessant/buster/releases/download/v3.1.0/buster_captcha_solver_for_humans-3.1.0-chrome.zip"
TARGET_DIR = "extensions/buster"

def install_buster():
    if os.path.exists(TARGET_DIR):
        print("Buster extension already exists.")
        return

    print("Downloading Buster extension...")
    response = requests.get(EXTENSION_URL)
    response.raise_for_status()

    print("Extracting...")
    with zipfile.ZipFile(io.BytesIO(response.content)) as z:
        z.extractall(TARGET_DIR)
    
    print("Buster installed successfully to", TARGET_DIR)

if __name__ == "__main__":
    if not os.path.exists("extensions"):
        os.makedirs("extensions")
    install_buster()
