exports.randomId = function(length) {
    var callbacks = [
        function() {
            //48 - 57 ('0' - '9')
            return ((Math.round(Math.random() * 101)) % 10) + 48;
        },
        function() {
            //65 - 90 ('A' - 'Z')
            return ((Math.round(Math.random() * 101)) % 26) + 65;
        },
        function() {
            //97 - 122 ('a' - 'z')
            return ((Math.round(Math.random() * 1001)) % 26) + 97;
        }
    ];
    var result = '';
    for (var i = 0; i < length; i++) {
        var choice = Math.round(((Math.random() * 11) % (callbacks.length - 1)));
        result += String.fromCharCode(callbacks[choice]());
    }
    return result;
}
