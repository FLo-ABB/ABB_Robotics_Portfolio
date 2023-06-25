import json
import os
import zipfile
import shutil

import requests

zip_name = "robots_db_prod.zip"
zip_url = f"https://xrhayesstoragetest.blob.core.windows.net/libraries/{zip_name}"
extracted_path = "./extracted"
img_to_update = set()


def download_and_extract_zip(zip_url: str, extracted_path: str) -> None:
    """
    Downloads and extracts a ZIP file from the given URL to the specified path.

    Args:
        zip_url (str): The URL of the ZIP file to download.
        extracted_path (str): The path to extract the contents of the ZIP file.

    Returns:
        None

    Raises:
        requests.RequestException: If there is an error in the HTTP request.
        zipfile.BadZipFile: If the downloaded file is not a valid ZIP file.
        zipfile.LargeZipFile: If the extracted ZIP file exceeds ZIP file size limits.
        FileNotFoundError: If the extracted path does not exist.
    """
    try:
        response = requests.get(zip_url)
        response.raise_for_status()

        with open(zip_name, "wb") as f:
            f.write(response.content)

        with zipfile.ZipFile(zip_name, "r") as zip_ref:
            zip_ref.extractall(extracted_path)

    except (requests.RequestException, zipfile.BadZipFile, zipfile.LargeZipFile, FileNotFoundError) as e:
        print(f"Error occurred while downloading and extracting the ZIP file: {e}")


def is_json_files_equal(json_file_extracted: dict, json_file_website: dict) -> bool:
    """
    Checks if two JSON files are equal.

    Args:
        json_file_extracted (dict): The extracted JSON file.
        json_file_website (dict): The JSON file from the website.

    Returns:
        bool: True if the JSON files are equal, False otherwise.
    """
    return json_file_extracted == json_file_website


def get_json_from_js_var(js_file_path: str, var_name: str) -> dict:
    """
    Extracts a JSON object from a JavaScript file variable.

    Args:
        js_file_path (str): The path to the JavaScript file.
        var_name (str): The name of the JavaScript variable containing the JSON object.

    Returns:
        dict: The extracted JSON object.

    Raises:
        FileNotFoundError: If the JavaScript file does not exist.
        IndexError: If the JavaScript variable is not found in the file.
        json.JSONDecodeError: If there is an error decoding the JSON object.
    """
    try:
        with open(js_file_path, "r", encoding='utf-8') as f:
            json_file_string = f.read().split("var " + var_name + " = ")[1].split(";")[0]

        json_file = json.loads(json_file_string)
        return json_file

    except (FileNotFoundError, IndexError, json.JSONDecodeError) as e:
        print(f"Error occurred while extracting JSON object from JavaScript file: {e}")


def is_imgs_equal(image_folder_extracted: str, image_folder_website: str) -> bool:
    """
    Checks if the images in two folders are equal.

    Args:
        image_folder_extracted (str): The path to the extracted image folder.
        image_folder_website (str): The path to the website image folder.

    Returns:
        bool: True if the images are equal, False otherwise.
    """
    imgs_equal = True
    for filename in os.listdir(image_folder_extracted):
        file_extracted = os.path.join(image_folder_extracted, filename)
        file_website = os.path.join(image_folder_website, filename)
        if (not os.path.isfile(file_website) or (os.path.getsize(file_extracted) != os.path.getsize(file_website))):
            imgs_equal = False
            img_to_update.add(filename)
    return imgs_equal


def main() -> None:
    """
    Main function to check the website's JSON file and images for updates.

    Returns:
        None
    """
    try:
        download_and_extract_zip(zip_url, extracted_path)
        json_file_website = get_json_from_js_var(os.path.join("assets", "inlineJson.js"), "myJson")
        with open(os.path.join(extracted_path, "database.json"), 'r', encoding='utf-8') as f:
            json_file_extracted = json.load(f)
        is_json_files_equal(json_file_extracted, json_file_website)
        image_folder_extracted = os.path.join(extracted_path, "img")
        image_folder_website = os.path.join("assets", "img")
        is_imgs_equal(image_folder_extracted, image_folder_website)
        if not is_json_files_equal(json_file_extracted, json_file_website):
            with open(os.path.join("assets", "inlineJson.js"), "w") as f:
                f.write("var myJson = " + json.dumps(json_file_extracted) + ";")
        if len(img_to_update) > 0:
            for filename in img_to_update:
                file_extracted = os.path.join(image_folder_extracted, filename)
                file_website = os.path.join(image_folder_website, filename)
                with open(file_extracted, "rb") as f:
                    with open(file_website, "wb") as f1:
                        f1.write(f.read())
        os.remove(zip_name)
        shutil.rmtree(extracted_path)

    except Exception as e:
        print(f"Error occurred during execution: {e}")


if __name__ == "__main__":
    main()
