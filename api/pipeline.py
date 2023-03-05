import os
import openai
from dotenv import load_dotenv
from flask import Flask, send_file, request, jsonify
import time
import tempfile
import json

from gtts import gTTS
import os
import playsound

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

app = Flask(__name__)
app.debug = True

@app.route("/")
def hello_world():
    return "Hello, Wold!"

@app.route("/gpt")
def chatgpt():
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", 
        messages=[{"role": "user", "content": "Tell the world about the ChatGPT API in the style of a pirate. Write less than 10 tokens. "}]
    )
    return completion["choices"][0]["message"]["content"]

@app.route("/whisper")
def whisper():
    file = open("api/LJ025-0076.wav", "rb")
    whisper_transcription = openai.Audio.transcribe("whisper-1", file)
    whisper_text = whisper_transcription["text"]
    return whisper_text

@app.route('/pipeline', methods=['POST'])
def pipeline():

    print("\n------------in pipeline!------------\n")

    if 'file' not in request.files:
        return 'No file found in request'
    
    print("\n------------after file not in request.files!------------\n")

    file = request.files['file'] 

    print("\n found file")


    if file.filename == '':
        return 'No file selected'
    
    if file and file.filename.endswith('.m4a'):
        # st = time.monotonic()

        # file = open("path_to_file", "rb")
        # file = open("api/LJ025-0076.wav", "rb")
        # file_ext = file.name[len(file.name)-4:]
        # valid_exts = [".wav", ".m4a", ".mp3"]
        # assert file_ext in valid_exts, f"Invalid file extension: {file_ext}"

        print(f"\n*********************** {file.filename} is good **************\n")
        print(f"----------file object::::{file}----------")

        # Save the contents of the file object to a new file with .m4a extension
        audio_data = file.read()
        with open('api/test.m4a', 'wb') as f:
            f.write(audio_data)

        file = open("api/test.m4a", "rb")
        
        whisper_transcription = openai.Audio.transcribe("whisper-1", file)
        whisper_text = whisper_transcription["text"]

        print(f"\n*********************** whisper success *********:\n")

        completion = openai.ChatCompletion.create(
            model="gpt-3.5-turbo", 
            messages=[{"role": "user", "content": f"Add more to the conversation and in less than 10 words to: {whisper_text}"}]
        )

        chatgpt_output = completion["choices"][0]["message"]["content"]

        tts = gTTS(text=chatgpt_output, lang='en')

        filename = "abc.mp3"
        tts.save("api/"+filename)
        
        # et = time.monotonic() - st

        # playsound.playsound(filename)
        # os.remove(filename) # do we need this?

        # Specify the return type as audio/mp3
        # return send_file(filename, mimetype='audio/mp3')
        # return jsonify({
        #     'data': send_file(filename, mimetype='audio/mp3').data.decode('ISO-8859-1'),
        #     'type': 'audio/mp3'
        # })
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 
    else:
        response_data = {'text': 'invalid file format'}
        return jsonify(response_data)

    # return {
    #     "output":chatgpt_output,
    #     "time":f"\n Recording took took: {et*1000:.2f} ms\n"
    #        }


if __name__ == '__main__':
    app.run()