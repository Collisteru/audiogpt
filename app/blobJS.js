function BlobFunc () {
    "use strict";
    const particleWorld = [];
    const velocityDecay  = 0.01;
    const particleLifetime = 1000.0;
    let fftAvgWin = 0;
    const paths = document.getElementsByTagName('circle');
    const visualizer = document.getElementById('visualizer');
    const mask = visualizer.getElementById('mask');
    const h = document.getElementsByTagName('h1')[0];

    const soundAllowed = function (stream) {
        window.persistAudioStream = stream;
        const audioContent = new AudioContext();
        const audioStream = audioContent.createMediaStreamSource( stream );
        const analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;

        const frequencyArray = new Uint8Array(analyser.frequencyBinCount);
        visualizer.setAttribute('viewBox', '0 0 100 100');
        const svgns = "http://www.w3.org/2000/svg",
        container = document.getElementById('visualizer');
      
        // we have 5 circles in our particle system
        const circleCount = 4; 
        for (let i = 1 ; i <= circleCount; i++) {
            const circle = document.createElementNS(svgns, 'circle');
            const initialRadius = circleCount/i;
            circle.setAttributeNS(null, 'cx', 50);
            circle.setAttributeNS(null, 'cy', 50);
            circle.setAttributeNS(null, 'r', initialRadius);
            circle.setAttributeNS(null, 'style', 'fill: none; stroke: white; stroke-width: 1px;' );
            mask.appendChild(circle);
            particleWorld.push({
              particleId: i,
              alive: true,
              acceleration: i/circleCount,
              velocity: i/circleCount,
              radius: initialRadius,
              birth: new Date().getTime() - (i * 100)
            })
        }
      
        var doDraw = function () {
            requestAnimationFrame(doDraw);
            analyser.getByteFrequencyData(frequencyArray);
          	const fftAvg = frequencyArray.reduce((fftv, t) => fftv + t) / 255
            fftAvgWin = (fftAvgWin + fftAvg) /2
            const radius = fftAvgWin / 20;
            particleWorld.forEach((particle, index)=>{
              const now = new Date().getTime();
              if (particle.alive){
                 if (particle.radius > 50) {
                    particle.alive = false;
                 }
                 if (particle.birth < now - particleLifetime) {
                    particle.alive = false;
                 }
              } else {
                  particle.velocity = Math.min(radius, 0.9);
                  particle.radius = 0;
                  particle.alive = true;
                  particle.birth= new Date().getTime() - (index * 100) // to maintain randomness
              }
              particle.velocity -= velocityDecay;
              particle.radius += particle.velocity;
              paths[index].setAttribute('r', particle.radius);
              const opacityOverAge = 1 - (Math.abs(particle.birth - now)/particleLifetime);
              paths[index].setAttribute('stroke-opacity', opacityOverAge);
            });
        }
        doDraw();
    }

    var soundNotAllowed = function (error) {
        h.innerHTML = "You must allow your microphone.";
        console.log(error);
    }

    navigator.getUserMedia({audio:true}, soundAllowed, soundNotAllowed);
};

export default BlobFunc