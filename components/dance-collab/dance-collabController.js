'use strict';

cs142App.controller('DanceCollabController', ['$scope', '$rootScope','$resource',
    function ($scope, $rootScope, $resource) {

    /*var audio = document.getElementById('myAudio');
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var analyser = audioCtx.createAnalyser();
    source = audioCtx.createMediaStreamSource(audio);
    source.connect(analyser);
    */
$scope.$on('$viewContentLoaded', function() {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
    //var ctx = new AudioContext();
          var audio = document.getElementById('myAudio');
          var audioSrc = ctx.createMediaElementSource(audio);
          var analyser = ctx.createAnalyser();
          // we have to connect the MediaElementSource with the analyser 
          audioSrc.connect(analyser);
          // we could configure the analyser: e.g. analyser.fftSize (for further infos read the spec)
         
          // frequencyBinCount tells you how many values you'll receive from the analyser
          var frequencyData = new Uint8Array(analyser.frequencyBinCount);
          // we're ready to receive some data!
          // loop
          function renderFrame() {
            analyser.fftSize = 2048;
            var bufferLength = analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            analyser.getByteTimeDomainData(dataArray);
            console.log(dataArray);

             /*requestAnimationFrame(renderFrame);
             // update data in frequencyData
             analyser.getByteFrequencyData(frequencyData);
             // render frame based on values in frequencyData
              console.log(frequencyData);*/
          }
          //audio.start();
          renderFrame();

          var canvas = document.getElementById('canvas');

          var canvasCtx = canvas.getContext('2d');

        var WIDTH = 700;
        var HEIGHT = 100;
        analyser.fftSize = 2048;
        var bufferLength = analyser.frequencyBinCount;
        var dataArray = new Uint8Array(bufferLength);

        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteTimeDomainData(dataArray);
            canvasCtx.fillStyle = 'rgb(200, 200, 200)';
            canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
            canvasCtx.beginPath();
            var sliceWidth = WIDTH * 1.0 / bufferLength;
            var x = 0;
            for(var i = 0; i < bufferLength; i++) {
   
                var v = dataArray[i] / 128.0;
                var y = v * HEIGHT/2;

                if(i === 0) {
                  canvasCtx.moveTo(x, y);
                } else {
                  canvasCtx.lineTo(x, y);
                }

                x += sliceWidth;
            }
            canvasCtx.lineTo(canvas.width, canvas.height/2);
            canvasCtx.stroke();
        };
        draw();
});

}]);

