var checkExist = setInterval(function() {
    if (jQuery('#podium').length) {
        var canvas = document.getElementById("podium");

        if (canvas.getContext) {
            var ctx = canvas.getContext("2d");

            ctx.shadowColor = "#00ff00";
            ctx.shadowBlur = 40;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = "#ef121b";
            ctx.fillRect(0, 90, 200, 150);
            ctx.fillRect(205, 40, 200, 200);
            ctx.fillRect(410, 140, 200, 100);

            ctx.fillStyle = "#fff";
            ctx.font = "30px Arial";
            ctx.fillText("Hello World", 15, 85);
            ctx.fillText("Hello World", 225, 35);
            ctx.fillText("Hello World", 430, 135);
        }


        clearInterval(checkExist);
    }
}, 500); // check every 100ms