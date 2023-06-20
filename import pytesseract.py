import pytesseract
import cv2


# Function to extract text from an image
def extract_text_from_image(image_path: object) -> object:
    # Open the image file
    image = cv2.imread(
        r'C:\\Users\\User\\OneDrive\\Desktop\\Cardboard-text-effect.jpg')
    pytesseract.pytesseract.tesseract_cmd = r'C:\Users\User\Downloads\tesseract-ocr-w64-setup-5.3.1.20230401.exe'
    # Perform OCR to extract text
    text = pytesseract.image_to_string(image, lang='eng')

    return text


if __name__ == '__main__':
    image_path = input(
        "C:\\Users\\User\\OneDrive\\Desktop\\Cardboard-text-effect.jpg ")

    text = extract_text_from_image(image_path)

    # Print the extracted text
    print("Extracted Text:")
    print(text)
