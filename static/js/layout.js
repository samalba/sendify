$(document).ready(function() {
    ZeroClipboard.setMoviePath('/swf/zeroclipboard-1.0.7.swf');
    var clipboard = new ZeroClipboard.Client();
    clipboard.glue('copy_btn');
    clipboard.hide();
    var container = $('body > div#index');
    container.hide();
    $('body > a').click(function() {
        $(this).hide();
        container.slideDown('fast', function() {
            clipboard.show();
        });
    });
    var button = $('div#index > input[type=button]');
    clipboard.addEventListener('mouseDown', function(client) {
        //does not work
        //$('#copy_btn').trigger('click');
        var text = $('div#index > input[type=text]').val();
        client.setText(text);
    });
});
