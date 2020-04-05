/* 参考サイト
https://medium.com/@gw_cule/gas%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E8%AA%8D%E5%8F%AF%E3%83%91%E3%82%BF%E3%83%BC%E3%83%B3-67f195d7a425
https://codeday.me/jp/qa/20190305/364927.html
*/
function main(){
  var id=PropertiesService.getScriptProperties().getProperty('slide_id');
  var folderid=PropertiesService.getScriptProperties().getProperty('folder_id');
  downloadPresentation(id,folderid)
}

function downloadPresentation(id,folderid) {
  var slideIds = getSlideIds(id); 

  for (var i = 0, slideId; slideId = slideIds[i]; i++) {
    var file = downloadSlide('Slide ' + (i + 1), id, slideId);
    moveSlides(file,folderid);
  }
}

function downloadSlide(name, presentationId, slideId) {

  var url = 'https://docs.google.com/presentation/d/' + presentationId +
    '/export/png?id=' + presentationId + '&pageid=' + slideId; 
  var options = {
    "muteHttpExceptions" : true,　　//エラー捕捉
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    }
  };
    try {
    //成功時
      var response = UrlFetchApp.fetch(url, options);
      var image = response.getAs(MimeType.PNG);
      image.setName(name);
      var file=DriveApp.createFile(image);
      return file;
  } catch(e) {
    //エラー時
    Logger.log(e.message);
  }

}

function getSlideIds(presentationId) {

  var url = 'https://slides.googleapis.com/v1/presentations/' + presentationId;
  var options = {
    "muteHttpExceptions" : true,　//エラー捕捉
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken()
    }
  };
  try{
    var response = UrlFetchApp.fetch(url, options);
  } catch(e) {
    //エラー時
     Logger.log(e.message);
  }
  var slideData = JSON.parse(response);
  return slideData.slides.map(function(slide) {
    return slide.objectId;
  });

}

function moveSlides(file,folderid){

  var folder = DriveApp.getFolderById(folderid);
  file.makeCopy(file.getName(),folder);//ルート(マイドライブ直下)に作られた画像ファイルをコピーする
  Logger.log(file.getName() + ": this file delete");
  file.setTrashed(true);

}