$(function ()
{
    $("html").on("dragover", function (e)
    {
        e.preventDefault();
        e.stopPropagation();
        $("h2").text("Drag here");
    });

    $("html").on("drop", function (e) { e.preventDefault(); e.stopPropagation(); });

    $('.upload-area').on('dragenter', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
        $("h2").text("Drop");
    });

    $('.upload-area').on('dragover', function (e)
    {
        e.stopPropagation();
        e.preventDefault();
        $("h2").text("Drop");
    });

    $('.upload-area').on('drop', function (e)
    {
        e.stopPropagation();
        e.preventDefault();

        $("h2").text("Checking...");

        var file = e.originalEvent.dataTransfer.files;

        showImage(file[0]);

        resizeAndUploadImage(file[0]);
    });

    $("#uploadfile").click(function ()
    {
        $("#file").click();
    });

    $("#file").change(function ()
    {
        var file = $('#file')[0].files[0];
        showImage(file);
        resizeAndUploadImage(file);
    });
});


function showImage(file)
{
    var reader = new FileReader();
    reader.onload = function (e)
    {
        $('.upload-area').css("background-image", "url(" + e.target.result + ")");
    }
    reader.readAsDataURL(file);
}

function resizeAndUploadImage(file)
{

    if (file.type.match(/image.*/))
    {
        var reader = new FileReader();
        reader.onload = function (readerEvent)
        {
            var image = new Image();
            image.onload = function (imageEvent)
            {

                var canvas = document.createElement('canvas'),
                    max_size = 600,
                    width = image.width,
                    height = image.height;
                if (width > height)
                {
                    if (width > max_size)
                    {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else
                {
                    if (height > max_size)
                    {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');
                var resizedImage = dataURLToBlob(dataUrl);

                checkImageWithNyckel(resizedImage);
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
    }
    else
    {
        alert("You must choose an image");
        resetPage();
    }
}

var dataURLToBlob = function (dataURL)
{
    var BASE64_MARKER = ';base64,';
    if (dataURL.indexOf(BASE64_MARKER) == -1)
    {
        var parts = dataURL.split(',');
        var contentType = parts[0].split(':')[1];
        var raw = parts[1];

        return new Blob([raw], { type: contentType });
    }

    var parts = dataURL.split(BASE64_MARKER);
    var contentType = parts[0].split(':')[1];
    var raw = window.atob(parts[1]);
    var rawLength = raw.length;

    var uInt8Array = new Uint8Array(rawLength);

    for (var i = 0; i < rawLength; ++i)
    {
        uInt8Array[i] = raw.charCodeAt(i);
    }

    return new Blob([uInt8Array], { type: contentType });
}


function displayResult(response)
{
    resetPage();
    $("#title").text(response.labelName);
}

function resetPage()
{
    $("#thinking").hide();
    $(".upload-area").show();
    $("h2").text("Drop your image here");
}

function checkImageWithNyckel(image)
{
    var formdata = new FormData();
    formdata.append('file', image);

    $.ajax({
        url:
		'https://www.nyckel.com/v1/functions/e2x1tvpv04s7y45c/invoke',
        type: 'post',
        data: formdata,
        contentType: false,
        processData: false,
        dataType: 'json',
        success: function (response)
        {
            displayResult(response);

            console.log(response);
        },
        error: function (response)
        {
            alert("Error checking image", response);
            $("#title").show();
            resetPage();
        }
    });
}