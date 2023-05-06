   const cam = document.getElementById('cam');
    const start = document.getElementById('start');
    const live = document.getElementById('live');

    start.addEventListener('click', startCam);

    async function startCam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            cam.srcObject = stream;
            await cam.play();
        } catch (error) {
            console.error(error);
        }

        const model = await cocoSsd.load();
        const children = [];

        setInterval(() => {
            model.detect(cam).then(predictions => {
                console.log('Predictions:', predictions);

                // loop through predictions
                for (let i = 0; i < children.length; i++) {
                    live.removeChild(children[i]);
                }
                children.splice(0);

                for (let n = 0; n < predictions.length; n++) {

                    const obj = predictions[n];
                    const className = obj.class;
                    const bbox = obj.bbox;

                    const box = document.createElement('div');
                    box.className = 'box';
                    box.style.left = predictions[n].bbox[0] + 'px';
                    box.style.top = predictions[n].bbox[1] + 'px';
                    box.style.width = predictions[n].bbox[2] + 'px';
                    box.style.height = predictions[n].bbox[3] + 'px';

                    const prob = document.createElement('p')
                    prob.className = 'prob';
                    prob.innerHTML = `Confidence is ${Math.floor(parseFloat(predictions[n].score) * 100)}%`;
                    prob.style.marginLeft = predictions[n].bbox[0] + 'px';
                    prob.style.marginTop = '-' + (predictions[n].bbox[1] - 10) + 'px';
                    prob.style.width = (predictions[n].bbox[2] - 10) + 'px';
                    prob.style.top = '0';
                    prob.style.left = '0';



                    live.appendChild(box);
                    live.appendChild(prob)
                    children.push(box);
                    children.push(prob)

                    if (className === 'person') {
                        for (let m = 0; m < predictions.length; m++) {
                            if (m !== n && predictions[m].class === 'cell phone') {
                                const cellBox = predictions[m].bbox;
                                if (intersects(bbox, cellBox)) {
                                    alert('Person detected inside cell phone box!');
                                }
                            }
                        }
                    }

                }



                function intersects(bbox1, bbox2) {
                    const x1 = bbox1[0], y1 = bbox1[1], w1 = bbox1[2], h1 = bbox1[3];
                    const x2 = bbox2[0], y2 = bbox2[1], w2 = bbox2[2], h2 = bbox2[3];
                    return !(x1 + w1 < x2 || x2 + w2 < x1 || y1 + h1 < y2 || y2 + h2 < y1);
                }





            });
        }, 1000);
    }
