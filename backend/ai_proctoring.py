import cv2
import numpy as np
import base64

# Load Haar Cascade (face detection)
face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

def analyze_frame(image_base64: str):
    try:
        img_data = base64.b64decode(image_base64.split(",")[1])
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5)

        if len(faces) == 0:
            return "no_face"

        elif len(faces) > 1:
            return "multiple_faces"

        else:
            return "normal"

    except Exception:
        return "error"