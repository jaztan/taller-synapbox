// Importar dependencias
var AWS = require('aws-sdk'); 
// Configurar región AWS
AWS.config.region = 'us-west-2';
// Referencia al cliente de Rekogntion
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27'});

exports.handler = (event, context, callback) => {
  var filename = event.filename;
  var idEmpleado = event.idEmpleado;
  // Base de datos de credenciales
  var srcBucket = 'test-credenciales-cara';
  var srcKey = idEmpleado + ".jpg";
  // Foto escaneada 
  var targetBucket = 'test-scan-cara';
  var targetKey = decodeURIComponent(filename.replace(/\+/g, " "));
  
  var params = {
    SimilarityThreshold: 90, // Porcentaje de similitud
    SourceImage: {
      S3Object: {
        Bucket: srcBucket, 
        Name: srcKey
      }
    }, 
    TargetImage: {
      S3Object: {
        Bucket: targetBucket, 
        Name: targetKey
      }
    }
  };
  // Llamamos a Rekognition
  rekognition.compareFaces(params, function(err, result) {
    if (err) {
      console.log(err, err.stack);
      callback('No se pudieron comparar las caras...');
      return;
    }
    // Si se encuentra al menos una cara
    if (result !== null && result.FaceMatches !== null && result.FaceMatches.length > 0) { 
      var item = result.FaceMatches[0];
      console.log(JSON.stringify(item));
      // Si las caras coinciden, dejar entrar
      if (item !== null && item.Face !== null && item.Face.Confidence > 80) {
        callback(null, {"result": "Green"});  
        return;  
      } 
      
      callback(null, {"result": "Red"});
      return;
    }
    // Si no se encontró ninguna cara, no dejar pasar
    callback(null, {"result": "Red"});
  });
}
