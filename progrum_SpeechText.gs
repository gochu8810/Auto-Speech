//Googleスライドに入力しているスピーカーノートの内容を取得し、音声ファイル(mp3)に変換・保存する


//Googleスライドに入力しているスピーカーノートの内容を取得
function GetSpeechtext() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ss2 =ss.getSheetByName('シート1');
  let presentation = SlidesApp.openById("1xLaM9NJVk5PNfJ45ouiNuFQY3dm_qQVcmgjU9pLnNM8");
  
  var SpeechSlide = presentation.getSlides();
  let SlideCount=SpeechSlide.length;
  
  //var shapes = SpeechSlide.getShapes();
  for(let i=0; i<=SlideCount-1; i++){
    let stext = SpeechSlide[i].getNotesPage();
    let SpeechText = stext.getSpeakerNotesShape().getText().asString();
    ss2.getRange(i+1,1).setValue(SpeechText);
  }
  //for (let i = 0; i < shapes.length; i++){
  //var shape = SpeechSlide.getShapes()[i];  
  //Logger.log('シェイプ内の文字列: %s',shape.getText().asString());
  //}
}
  //'https://docs.google.com/presentation/d/1xLaM9NJVk5PNfJ45ouiNuFQY3dm_qQVcmgjU9pLnNM8/edit#slide=id.p';  
  //var presentation = SlidesApp.openByUrl(url);


//speechTextに音声にしたいテキストを引数として入れ、音声ファイル(mp3)に変換・保存する
function generateSpeechToDrive(speechText,fileName) { 
  //音声出力したいテキストデータと出力する音声データのファイル名を定義します。
  //var speechText ="ここに日本語テキストを入力してください";
  var name = fileName + ".mp3"

  //cloudText-to-SpeechにAPIでリクエスト時に送るjsonを定義します。
  //synthesizeメソッドで使うパラメータはhttps://cloud.google.com/text-to-speech/docs/reference/rest/v1/text/synthesize?hl=jaを参照してください。
  var json = {
    "audioConfig": {
      "audioEncoding": "MP3",
      "pitch": "5.00",
     "speakingRate": "1.10"
    },
    "input": {
    "text": speechText
    },
    "voice": {
      "languageCode": "ja-JP",
      "name": "ja-JP-Wavenet-A"
    }
  }

  //APIリクエストするためのペイロードやURL、ヘッダー情報を定義します。
  var payload = JSON.stringify(json);
  var url = "https://texttospeech.googleapis.com/v1beta1/text:synthesize";
  var headers = {
    "Content-Type": "application/json; charset=UTF-8",
    "Authorization": "Bearer " + ScriptApp.getOAuthToken()
  };

  //APIをポストするためのオプションを定義し、URLフェッチを行います。
  var options = {
    "method": "post",
    "headers": headers,
    "payload": payload
  };
  
  var data = UrlFetchApp.fetch(url, options);

  //取得したJSONデータをパースして取り扱えるようにします。
  var talkData =JSON.parse(data);

  //BASE64のデータとなっているので、デコードを行い、音声ファイルに変換します。
  var decoded = Utilities.base64Decode(talkData.audioContent);

  //デコードした音声データを音声用のBLOB形式に変換し、GoogleDriveに保存します。
  try{
    var blob = Utilities.newBlob(decoded, "audio/mpeg", name);
  }catch(e){
    var myFolder = DriveApp.getFolderById('1_a3DQAc85St3VmkptAEzA3ZfasR5bfkY');
    myFolder.createFile(blob);
    Logger.log("\nError: %s\nmimeType: %s\nfileSize: %s\nimageMediaMetadata: %s", e, mimeType, fileSize, imageMediaMetadata)
}

}
