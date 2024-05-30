        // Sets fileInput and preview for fileReader API
        let fileInput = document.getElementById("input");

        // Gets generate button and adds a "click" event listener and executes the "generate()" function
        const generateBTN = document.getElementById("generate");
        generateBTN.addEventListener("click", generate);

        // Gets resolution value
        const resolution = document.getElementById("resolution");
        const resolutionLabel = document.getElementById("resolution-label");
        let resolutionValue = parseInt(resolution.value, 10); // Invert the initial value
        resolution.addEventListener("change", () => {
            resolutionValue = parseInt(resolution.value, 10); // Invert the value
            console.log(`Resolution changed to: ${resolutionValue}`);
            resolutionLabel.innerText = `Resolution ${resolutionValue} px`;
        });

        function convertToSymbol(avg) {
            const symbols = '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\|()1{}[]?-_+~<>i!lI;:,"^`.';
            const index = Math.floor((avg / 255) * (symbols.length - 1));
            return symbols[index];
        }

        // Generate function
        function generate() {
            console.log("Generate button clicked");
            const fileReader = new FileReader();

            fileReader.readAsDataURL(fileInput.files[0]);

            fileReader.addEventListener("load", () => {
                const url = fileReader.result;

                const image = new Image();
                image.crossOrigin = "anonymous";
                image.src = url;

                image.addEventListener("load", () => {
                    // Create an off-screen canvas
                    const offScreenCanvas = document.createElement('canvas');
                    const offScreenCtx = offScreenCanvas.getContext('2d');

                    offScreenCanvas.width = image.width;
                    offScreenCanvas.height = image.height;
                    offScreenCtx.drawImage(image, 0, 0); // Draw the image at (0, 0)

                    let ASCIIArt = [];
                    let pixels = offScreenCtx.getImageData(0, 0, offScreenCanvas.width, offScreenCanvas.height);

                    for (let y = 0; y < pixels.height; y += resolutionValue) {
                        for (let x = 0; x < pixels.width; x += resolutionValue) {
                            let pos = (y * pixels.width + x) * 4;

                            if (pixels.data[pos + 3] > 128) { // Check the alpha value
                                let red = pixels.data[pos];
                                let green = pixels.data[pos + 1];
                                let blue = pixels.data[pos + 2];
                                let total = red + green + blue;
                                let averageColorValue = total / 3;

                                let symbol = convertToSymbol(averageColorValue);
                                ASCIIArt.push({ x: x, y: y, symbol: symbol, color: `rgb(${red}, ${green}, ${blue})` }); // Store position, symbol, and color
                            }
                        }
                    }

                    console.log("Processed Symbols: ", ASCIIArt);

                    // Clear off-screen canvas
                    offScreenCtx.clearRect(0, 0, offScreenCanvas.width, offScreenCanvas.height);

                    // Set font properties
                    offScreenCtx.font = `${resolutionValue}px monospace`;
                    offScreenCtx.textAlign = "left";
                    offScreenCtx.textBaseline = "top";

                    // Draw each symbol on the off-screen canvas with color
                    ASCIIArt.forEach(cell => {
                        offScreenCtx.fillStyle = cell.color;
                        offScreenCtx.fillText(cell.symbol, cell.x, cell.y);
                    });

                    // Create a download link
                    const link = document.createElement('a');
                    link.download = 'ascii-art.png';
                    link.href = offScreenCanvas.toDataURL('image/png');
                    link.click();
                });
            });
        }