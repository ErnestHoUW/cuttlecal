/* eslint-disable no-restricted-globals */

onmessage = (e) => {
    try {
        const reader = new FileReader();

        reader.onload = function(event) {
            const parsedData = JSON.parse(event.target.result);
            self.postMessage({ success: true, data: parsedData });
        };
        reader.readAsText(e.data);        
    } catch (error) {
        self.postMessage({ success: false, error: error.message });
    }
};
