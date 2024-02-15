/* eslint-disable no-restricted-globals */

onmessage = (e) => {
    try {
        const reader = new FileReader();

        reader.onload = function(event) {
            let a = performance.now()
            console.log("Parsing")
            const parsedData = JSON.parse(event.target.result);
            console.log("done parsing", performance.now() - a, 'ms')
            self.postMessage({ success: true, data: parsedData });
            console.log("done posting", performance.now() - a, 'ms')
        };
        reader.readAsText(e.data);        
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};
