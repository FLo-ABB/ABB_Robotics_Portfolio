import json
import os
import zipfile

import requests

# URL of the zip file
zip_url = "https://xrhayesstoragetest.blob.core.windows.net/libraries/robots_db_prod.zip"

# Path to the extracted zip file
extracted_path = "./extracted"
img_to_update = set()

def download_and_extract_zip(zip_url: str, extracted_path: str) -> None:
    response = requests.get(zip_url)
    with open("robots_db_prod.zip", "wb") as f:
        f.write(response.content)

    with zipfile.ZipFile("temp.zip", "r") as zip_ref:
        zip_ref.extractall(extracted_path)

def is_json_files_equal(json_file_extracted: json, json_file_website: json) -> bool:
    if (json_file_extracted == json_file_website):
        return True
    else:
        return False
    
def get_json_from_js_var(js_file_path: str, var_name: str) -> json:
    with open(js_file_path, "r") as f:
        json_file_string = f.read().split("var " + var_name + " = ")[1].split(";")[0]
    json_file = json.loads(json_file_string, sort_keys=True)
    return json_file

def is_imgs_equal(image_folder_extracted: str, image_folder_website: str) -> bool:
    for filename in os.listdir(image_folder_extracted):
        file_extracted = os.path.join(image_folder_extracted, filename)
        file_website = os.path.join(image_folder_website, filename)
        if (not os.path.isfile(file_website) or (os.path.getsize(file_extracted) != os.path.getsize(file_website))):
            imgs_equal = False
            img_to_update.add(filename)
        else:
            imgs_equal = True
    return imgs_equal

def main() -> None:
    # Download and extract the zip file
    download_and_extract_zip(zip_url, extracted_path)
    json_file_website = get_json_from_js_var(os.path.join("assets", "inlineJson.js"), "myJson")
    json_file_extracted = json.load(os.path.join(extracted_path, "database.json"), sort_keys=True)
    # Compare the two files
    is_json_files_equal(json_file_extracted, json_file_website)
    # Compare imgs
    image_folder_extracted = os.path.join(extracted_path, "img")
    image_folder_website = os.path.join("assets", "img")
    is_imgs_equal(image_folder_extracted, image_folder_website)
    # Replace the json content inlined and copy the imgs
    if (not is_json_files_equal):
        with open(os.path.join("assets", "inlineJson.js"), "w") as f:
            f.write("var myJson = " + json.dumps(json_file_extracted) + ";")
    if (len(img_to_update) > 0):
        for filename in img_to_update:
            file_extracted = os.path.join(image_folder_extracted, filename)
            file_website = os.path.join(image_folder_website, filename)
            with open(file_extracted, "rb") as f:
                with open(file_website, "wb") as f1:
                    f1.write(f.read())

if __name__ == "__main__":
    main()
            



