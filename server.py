from flask import Flask, request

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload():
    if 'video' not in request.files:
        return 'No video uploaded', 400

    video = request.files['video']
    video.save('C:\\Users\\User\\OneDrive\\Desktop\\server\\uploaded_video.mp4')

    return 'Video uploaded successfully'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
