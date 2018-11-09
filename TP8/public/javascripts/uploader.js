$(() => {
    $('#files').load('http://localhost:8888/files');

    $('#send').click(e => {
        e.preventDefault();
        var file = $('#file')[0].files[0];
        var upload_ts = new Date();
        $('#files').append(
            '<tr>' + '<td>' + `<a href="/uploaded/${file.name}">` + file.name + '</a>' + '</td>'
                   + '<td>' + $('#desc').val() + '</td>'
                   + '<td>' + upload_ts + '</td>' +
            '</tr>');
        ajaxPost(file, upload_ts);
    });

    function ajaxPost(file, upload_ts) {

        var desc = $('#desc').val();
        var formData = new FormData();
        formData.append('file', file);
        formData.append('desc', desc);
        formData.append('time', upload_ts);

        $.ajax({
            type: "POST",
            processData: false,
            contentType: false,
            url: "http://localhost:8888/upload",
            data: formData,
            dataType: false,
            success: p => alert(JSON.stringify(p)),
            error: e => {
                alert('Erro no post: ' + JSON.stringify(e));
                console.log("Erro no post: " + JSON.stringify(e));
            }
        });

        $('#file').val('');
        $('#desc').val('');
    }
})