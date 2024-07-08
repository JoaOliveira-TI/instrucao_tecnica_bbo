pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';

function convertToBase64(pdfPath) {
    fetch(pdfPath)
        .then(response => response.blob())
        .then(blob => {
            var fileReader = new FileReader();

            fileReader.onload = function(fileLoadedEvent) {
                var base64 = fileLoadedEvent.target.result.split(',')[1];
                loadPDF(base64);
            };

            fileReader.readAsDataURL(blob);
        })
        .catch(error => {
            console.error('Erro ao carregar o arquivo PDF:', error);
        });
}

function loadPDF(base64) {
    var binaryString = atob(base64);
    var len = binaryString.length;
    var bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    var loadingTask = pdfjsLib.getDocument({
        data: bytes,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.11.338/cmaps/',
        cMapPacked: true
    });

    loadingTask.promise.then(function(pdf) {
        console.log('PDF carregado com sucesso.');

        var numPages = pdf.numPages;
        var pagesPromises = [];

        for (var i = 1; i <= numPages; i++) {
            pagesPromises.push(getPageText(i, pdf));
        }

        Promise.all(pagesPromises).then(function(pagesText) {
            // Exibe o texto de todas as páginas no console
            console.log('Texto extraído de todas as páginas:');
            console.log(pagesText.join('\n'));

            // Exibe o texto no elemento de saída
            var outputElement = document.getElementById('output');
            outputElement.innerHTML = pagesText.join('<br>');

            // Armazena o texto original para pesquisa
            outputElement.setAttribute('data-original-text', pagesText.join('\n'));
            console.log('Texto original armazenado com sucesso.');
        });
    }).catch(function(reason) {
        // Erro ao carregar o PDF
        console.error('Erro ao carregar o PDF:', reason);
    });
}

function getPageText(pageNum, pdf) {
    return pdf.getPage(pageNum).then(function(page) {
        return page.getTextContent().then(function(textContent) {
            var pageText = '';

            textContent.items.forEach(function(item) {
                pageText += item.str + ' ';
            });

            return pageText.trim();
        });
    });
}

function searchKeyword() {
    var keyword = document.getElementById("searchInput").value.toLowerCase();
    var outputElement = document.getElementById("output");

    if (outputElement) {
        var originalText = outputElement.getAttribute('data-original-text');
        console.log('Texto original recuperado:', originalText);

        if (originalText) {
            // Remove qualquer destaque anterior
            var highlightedText = originalText.replace(new RegExp(keyword, 'gi'), function(match) {
                return '<span class="highlight">' + match + '</span>';
            });

            outputElement.innerHTML = highlightedText;
        } else {
            console.error('Texto original não encontrado.');
        }
    } else {
        console.error('Elemento de saída não encontrado.');
    }
}

function loadSelectedPDF() {
    var pdfSelector = document.getElementById('pdfSelector');
    var selectedPDF = pdfSelector.value;

    if (selectedPDF) {
        convertToBase64(selectedPDF);
    } else {
        console.error('Nenhum PDF selecionado.');
    }
}