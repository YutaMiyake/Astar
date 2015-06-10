
var Astar = (function(){

    /* initializations/declarations ***********************************/
    const $bgCover = $('#bg-cover');
    var brightColor;
    var oppositeColor;
    var hoverColor;

    const $logo = $('.logo');
    const $toolbar = $('.btn-toolbar');
    const $newTag = $('.newTag');
    const $newBook = $('.newBook');
    const $form = $('.form');
    const $modes = $('.btn-g1');
    const $btn = $('.btn-g1 .btn');
    const $bt1 = $('.bt1');
    const $bt2 = $('.bt2');
    const $bt3 = $('.bt3');
    const $btSet = $('.bt-setting');
    const $bgset = $('.bg-set');

    const $add = $('.add');
    const $tbox = $('.tbox');
    const $tbody = $('tbody');

    const $notebooks = $('#m-notebooks');
    const $mnotes = $('.m-notes');
    const $setting = $('#setting');

    const $body = $('body');
    const $main = $('#main');
    const $oggrid = $('#og-grid');
    const $list = $('.list');
    const $allstep = $('.allstep');
    const $panel = $('.panel');
    const $chunk = $('#chunk');
    const $calendar = $('#calendar');

    var $dateEditor = $('.date-edit');

    var cfg = {};
    var win = {};

    var new_win = {};
    var notebooks = {};
    var currentNote;
    var tags = {};
    var steps = {};
    var source = [];
    var sid;
    var numSteps;
    var taskDone;
    var ctr;

    var sideMenuOn = true;
    var dateEditOn = false;
    var configOn = false;

    cfg = readConfig(); 

    // start  ******************************************************
    function start()
    {
        setBackground();
        readNotes();
        showMain();
        addMainEventHandlers();
        addSideMenuEventHandlers();
        showGrid();
        addGridEventHandlers();
    }

    // header  ******************************************************
    function showHeader()
    {
        //$form.show();
        $modes.show();
    }
    function hideHeader()
    {
        //$form.hide();
        $modes.hide();
    }

    // main *********************************************************
    function showMain()
    {
        resizeWindow();
    }

    // side menu *******************************************************
    function setupSideMenu()
    {
        if(!sideMenuOn) 
            return;

        var src = sortNoteBooksBy("updated","MR");
        var size = Object.keys(notebooks).length;

        $mnotes.html('');
        for(ctr = 0; ctr < size; ctr++)
        {
            $mnotes.append('<li class="m-note" id="side-'+src[ctr].name+'">'+src[ctr].name+'</li>');
        }
    }
    function highlightMItem($mitem)
    {
        if(!sideMenuOn) 
            return;

        clearHighlights();
        $mitem.css('border-left','solid '+brightColor+' 4px');
    }
    function highlightMNote(notename)
    {
        if(!sideMenuOn) 
            return;

        clearHighlights();
        $mnotes.find('#side-'+notename).css('border-left','solid '+brightColor+' 4px');
    }
    function clearHighlights()
    {
        if(!sideMenuOn) 
            return;

        $notebooks.css('border-left','none');
        $mnotes.find('.m-note').css('border-left','none');
    }

    // Grid *********************************************************
    function showGrid()
    {
        var src = sortNoteBooksBy("updated","MR");
        var size = Object.keys(notebooks).length;

        for(ctr = 0; ctr < size; ctr++)
        {
            pushNote(src[ctr]);
        }

        $oggrid.fadeIn(300);

        $logo.html('A*');
        highlightMItem($notebooks);
        $newBook.show();
        $btSet.show();
    }
    function hideGrid()
    {
        $oggrid.html('');
        $newBook.hide();
        $oggrid.hide();
    }

    // notebook *******************************************************
    function Notebook(name,bgtype,bgimg,bgcolor)
    {
        this.name = name;
        this.created = moment().format('MMMM Do YYYY, h:mm a');
        this.updated = this.created;
        this.modified = false;
        this.bgimg = typeof bgimg !== 'undefined' ? bgimg:"img/bookcover.jpg";
        this.disptype = "list";
    }
    function pushNote(note,option)
    {
        if(option === "front")
        {
            $oggrid.prepend($("<li class='note' id='note-"+note.name+"'></li>"));
        }
        else
        {
            $oggrid.append($("<li class='note' id='note-"+note.name+"'></li>"));
        }

        var $note = $('#note-'+note.name);
        $note.html('<div class="note-cover">'+'<div class="note-setting btn-lg glyphicon glyphicon-cog"></div>'+'</div>'+'<input class="note-name" value="'+note.name+'">');

        if(fs.existsSync(note.bgimg))
        {
            $note.find('.note-cover').css("background-image","url("+encodeURI("file:///"+note.bgimg.substr(1).replace())+")"); 
        }
        else
        {
            console.log("AA");
            $note.find('.note-cover').css("background-image","url(img/bookcover.jpg)"); 
            notebooks[note.name].bgimg = "img/bookcover.jpg";
        }
    }

    function openNote(notename)
    {
        if(notename !== undefined)
        {
            console.log("Open note: "+notename+" ...");
            $logo.html(notename);
            highlightMNote(notename);
            currentNote = notename;
            readNoteData(notename);
            hideGrid();
            showHeader();
            showSteps();
            initEventHandlers();
            addEventHandlers();
        }
    }
    function closeNote()
    {
        if(currentNote !== undefined)
        {
            console.log("Close note: "+currentNote+" ...");
            saveNote(currentNote);
            currentNote = undefined;
            clearBasicHandlers();
            clearHandlers();
            clearDisplay();
        }
    }
    function readNotes()
    {
        notebooks = readAppFiles("notes");
        setupSideMenu();
    }
    
    function readNoteData(notename)
    {
        steps = {};
        temp = {};
        sid = 0;
        numSteps = 0;
        tags = {};

        tags = readAppFiles("tags",notename);
        temp = readAppFiles("steps",notename);

        for(ctr in tags)
        {
            tags[ctr].stepIDs = [];
        }

        if(steps !== undefined)
        {
            for(ctr in temp)
            {
                steps[sid] = temp[ctr];
                steps[sid].id = sid;
                sid++;
            }
            numSteps = sid;
        }
    }
    function saveNote(notename)
    {
        if(notename !== undefined && notebooks[notename].modified)
        {
            notebooks[notename].updated = moment().format('MMMM Do YYYY, h:mm a');
            notebooks[notename].modified = false;
            writeAppFiles("steps",steps,notename);
            writeAppFiles("tags",tags,notename);
        }
    }

    function isNewBook(name)
    {
        for(ctr in notebooks)
        {
            if (name === notebooks[ctr].name)
            {
                return false;
            }
        }
        return true;
    }
    function sortNoteBooksBy(string,option)
    {
        var temp = [];
        for(ctr in notebooks)
        {
            temp.push(notebooks[ctr]);
        }
        temp.sort(compNoteBooksBy(string,option));
        return temp;
    }
    function compNoteBooksBy(string,option)
    {
        if(string === "updated")
        {
            // most recent
            if(option === "MR")
            {
                return compNoteBooksByMRUpdated;
            }
            // least recent
            else
            {
                return compNoteBooksByLRUpdated;
            }
        }
        else if(string === "created")
        {
            return compNoteBooksByCreated;
        }
    }
    function compNoteBooksByMRUpdated(a,b) {
        var date1 = moment(a.updated,'MMMM Do YYYY, h:mm a');
        var date2 = moment(b.updated,'MMMM Do YYYY, h:mm a');

        if(date1 > date2) return -1;
        else if(date1 < date2) return 1;
        else return 0;
    }
    function compNoteBooksByLRUpdated(a,b) {
        var date1 = moment(a.updated,'MMMM Do YYYY, h:mm a');
        var date2 = moment(b.updated,'MMMM Do YYYY, h:mm a');

        if(date1 < date2) return -1;
        else if(date1 > date2) return 1;
        else return 0;
    }
    function compNoteBooksByNewCreated(a,b) {
        var date1 = moment(a.created,'MMMM Do YYYY, h:mm a');
        var date2 = moment(b.created,'MMMM Do YYYY, h:mm a');

        if(date1 > date2) return -1;
        else if(date1 < date2) return 1;
        else return 0;
    }
    function compNoteBooksByOldCreated(a,b) {
        var date1 = moment(a.created,'MMMM Do YYYY, h:mm a');
        var date2 = moment(b.created,'MMMM Do YYYY, h:mm a');

        if(date1 < date2) return -1;
        else if(date1 > date2) return 1;
        else return 0;
    }
    // steps **********************************************************
    function Step(id,title,tag,start,end)
    {
        this.id = id;
        this.title = title;
        this.tag = typeof tag !== 'undefined' ? tag : "inbox";
        this.start = typeof start !== 'undefined' ? start : "2099-01-01";
        this.end = typeof end !== 'undefined' ? end : this.start;
        this.color = tags[this.tag].color;
        this.textColor = gettextColor(hexToRgb(tags[this.tag].color));
        this.created = new Date();
        this.updated = this.created;
        this.marked = false;
        this.allDay = true;
        this.toDo = this.start === "2099-01-01"? true: false;
    }
    function copySteps()
    {
        var temp = [];
        for(ctr in steps)
        {
            temp.push(steps[ctr]);
        }
        return temp;
    }
    function compareMilli(a,b) {
        var date1 = moment(a.start);
        var date2 = moment(b.start);

        if(date1 < date2) return -1;
        else if(date1 > date2) return 1;
        else return 0;
    }
    function pushStep(step)
    {
       if (cfg["disp-type"] === "list")
       {    
            var color = hexToRgb(tags[step.tag].color);
            var date = formatDate(step.start);
            $tbody.append("<tr id='"+"step-"+step.id+"'><th><div class='step'></div></th><th class='step-title'><input type='text' value=\'"+step.title+"\'></th><th class='step-tag' >"+"<div class='step-color'></div>"+step.tag+"</th><th class='step-date'>"+date+"</th><th><div class='minus pull-right btn-lg glyphicon glyphicon-remove'></div></th></tr>");
            $("#"+"step-"+step.id+" .step-color").css('background-color',tags[step.tag].color);

            if(step.marked)
            {
                markStep($('#step-'+step.id));
                taskDone++;
            }

            if(taskDone === numSteps)
            {
                $allstep.addClass('marked');
            }
            else
            {
                $allstep.removeClass('marked');
            }
            
       }
       else if (cfg["disp-type"] === "chunk")
       {
            var $tag = $('#tag-'+step.tag);
            var date = formatDate(step.start);
            $tag.find('tbody').append("<tr id='"+"step-"+step.id+"'><th><div class='step'></div></th><th class='step-title'><input type='text' value=\'"+step.title+"\'></th><th class='step-date'>"+date+"</th><th><div class='minus pull-right btn-lg glyphicon glyphicon-remove'></div></th></tr>");
            tags[step.tag].steps++;
            tags[step.tag].stepIDs.push(step.id);

            if(step.marked)
            {
                 markStep($('#step-'+step.id));
                 tags[step.tag].marked++;
            }

             if(tags[step.tag].marked === tags[step.tag].steps)
             {
                 //$tag.find('.allstep2').addClass('marked');
                 $tag.find('.step-bg').show();
             }
             else
             {
                 //$tag.find('.allstep2').removeClass('marked');
                 $tag.find('.step-bg').hide();
             }
       }
    }
    function markStep($step)
    {
        $step.find('.step').addClass('marked');
        $step.css("background-color","rgba(0,0,0,0.2)");
    }
    function formatDate(date)
    {
        var time;
        var today = moment();

        if (date === "2099-01-01")
            {
                time = "ToDo";
            }
        else
        {
            time = moment(date).format("M/D/YY");
            if (time === "Invalid date")
            {
                time = "";
            }
        }
        return time;
    }
    function formatTime(date)
    {
        var time;
        time = moment(date).format("HH:mm");
        return time;
    }   
    function updateDateField(stepID)
    {
        $("#step-"+stepID+" .step-date").html(formatDate(steps[stepID].start));
    }
    function getStep()
    {
        var data = $tbox.val().trim();
        var title,tag;
        var stepObj;

        if (data !== "")
        {
            if (cfg["disp-type"] === "list")
            {
                title = data;
                stepObj = new Step(title);
                pushStep(stepObj);
                steps.push(stepObj);
            }
            else if(cfg["disp-type"] === "chunk")
            {
                
                var stepObj = getTags(data);
                if (stepObj){
                    pushStep(stepObj);
                    steps.push(stepObj);
                }
            }
            $tbox.val('').blur(); // clear value and go out of focus
        }
    }
    // tags *******************************************************
    function Tag(name,color)
    {
        this.name = name;
        this.color = typeof color !== 'undefined' ? color:"#8C1515";
        this.steps = 0;
        this.marked = 0;
        this.stepIDs = [];
    }
    function pushTag(tag)
    {
        var table = "<table class='mytable2'><thead><tr><th class='stepbox2' style='width: 30px'></th><th style='width: 200px'></th><th style='width: 30px'></th><th style='width: 20px'></th></tr></thead><tbody class='tbody'></tbody></table>";
        var addButton = "<button class='pull-right plus btn-lg glyphicon glyphicon-plus'></button>";
        var colorPicker = "<input class='colorpicker' id='colorpicker' type='color' name='favcolor' value='"+tag.color+"'>";
        var color = hexToRgb(tag.color);

        tag.marked = 0;
        tag.steps = 0;

        $chunk.append("<div class='tag' id=\'tag-"+tag.name+"\'><div class='tagname'>"+"<input class='edit-tagname' type='text' value='"+tag.name+"'></div><div class='table-wrapper'></div></div>");
        // "<img class='allstep2 pull-left'>"
        
        $tag = $('#tag-'+tag.name);

        // (gettextColor(hexToRgb(tag.color)) === "#ffffff")? $tag.find('img').attr("src","img/allstep20.png") : $tag.find('img').attr("src","img/step20.png");
        $tag.find('.table-wrapper').append(table);
        $tag.append(colorPicker);
        $tag.append(addButton);
        $tag.append("<div class='step-bg'></div>");
        $tag.find('.tagname').css("background-color",tag.color);
        $tag.find('.tagname').css("color",gettextColor(hexToRgb(tag.color)));
        //$tag.find('.allstep2').addClass('marked');
    }

    function resizeWindow()
    {
        var width = $body.width();
        var height = $body.height();
        $('#main').css('width',(width-200)+'px');
        $('#main').css('height',(height-50)+'px');
    }
    /*
    function setScroll()
    {
        $('#title').on({
            'mousewheel': function(e) {
                if (e.target.id == 'el') return;
                e.preventDefault();
                e.stopPropagation();
            }
        });

        $('#sideMenu').on({
            'mousewheel': function(e) {
                if (e.target.id == 'el') return;
                e.preventDefault();
                e.stopPropagation();
            }
        });
    }*/
    function resizeTag()
    {
        var width = $main.width();
        if (width >= 992){
            $('.tag').css('width',(width-60)/3+'px');
        }
        else
        {
            $('.tag').css('width',(width-40)/2+'px');
        }
    }

    function isNewTag(name)
    {
        for(ctr in tags)
        {
            if (name === tags[ctr].name)
            {
                return false;
            }
        }
        return true;
    }

    // background *****************************************************
    function setBackground()
    {
        console.log("Background-type: "+cfg["bg-type"]);

        if (cfg["bg-type"] === "image")
        {
            setBgImg();
        }
        else if(cfg["bg-type"] === "color")
        {
            setBgColor();
        }
        $body.css("color",brightColor);
    }
    function setBgImg()
    {
        var bgPath = cfg['bg-path'];
        if(fs.existsSync(bgPath))
        {
            var url = encodeURI("file:///"+bgPath.substr(1).replace());
            // force to reload the background-image
            $bgCover.attr("src",url+"?v="+(+new Date));

            $bgCover.css("display","block");
            var bgAvg = getAverageRGB($bgCover.get(0));
            brightColor = gettextColor(bgAvg);
            oppositeColor = gettextColor(hexToRgb(brightColor));
            hoverColor = rgbToStr2(hexToRgb(oppositeColor),0.7);
        }
        else
        {
            setBgColor();
        }
    }
    function setBgColor()
    {
        $bgCover.css("display","none");
        $body.css("background-color",cfg['bg-color']);
        brightColor = gettextColor(hexToRgb(cfg['bg-color']));
        oppositeColor = gettextColor(hexToRgb(brightColor));
        hoverColor = rgbToStr2(hexToRgb(oppositeColor),0.7);
    }

    // display *****************************************************
    function showSteps(){
        
        source = copySteps();
        source.sort(compareMilli);

        if (cfg["disp-type"] === "list")
        {
            $bt1.addClass('active');

            taskDone = 0;

            for (ctr = 0; ctr < numSteps; ctr++)
            {
                pushStep(source[ctr]);
            }

            $panel.fadeIn(300);
        }
        else if(cfg["disp-type"] === "chunk")
        {
            $bt2.addClass('active');
            $newTag.show();

            for(ctr in tags)
            {
                pushTag(tags[ctr]);
            }

            for (ctr = 0; ctr < numSteps; ctr++)
            {
                pushStep(source[ctr]);
            }
            resizeTag();
            $chunk.fadeIn(300);
        }
        else if(cfg["disp-type"] === "calendar")
        {
            var temp = [];

            $bt3.addClass('active');
            $calendar.fadeIn(300);
            
            $('#calendar').fullCalendar({
                height: window.innerHeight-70,
                header: { 
                    center:   'title',
                    right: 'month,agendaWeek,agendaDay',
                    left:  'today prev,next' },
                minTime: "06:00:00",
                views: {
                    week:{
                        titleFormat: 'MMM YYYY'
                     },
                },
                editable: true,
                eventDrop: function(event, delta, revertFunc) {
                    steps[event.id].start = event.start.format();
                    if (event.end !== null)
                        steps[event.id].end = event.end.format();
                    steps[event.id].allDay = event.allDay;
                },
                eventClick: function(calEvent, jsEvent, view) {
                    var title = prompt('Event Title:', calEvent.title, { buttons: { Ok: true, Cancel: false} });

                    if (title){
                        calEvent.title = title;
                        calendar.fullCalendar('updateEvent',calEvent);
                    }
                },
                eventResize: function(event, delta, revertFunc) {
                    steps[event.id].start = event.start.format();
                    steps[event.id].end = event.end.format();
                    steps[event.id].allDay = event.allDay;
                },
            });

            for(ctr = 0; ctr < numSteps; ctr++)
            {
                if (!source[ctr].toDo)
                {
                    temp.push(source[ctr]);
                }
            }
            $('#calendar').fullCalendar( 'addEventSource', temp );

        }
    }

    function clearDisplay(){
        var type = cfg["disp-type"];

        if (type === "list")
        {
            $tbody.html('');
            $panel.hide();
        }
        else if(type === "chunk")
        {
            $chunk.html('');
            $chunk.hide();
            $newTag.hide();

        }
        else if(type === "calendar")
        {
            $('#calendar').fullCalendar( 'removeEvents');
            $calendar.hide();
        }
    }

    /* handers ***************************************************************/

    // main -------------------------------------------------------------------
    function addMainEventHandlers()
    {
        $(window).resize(function(){
            resizeWindow();
            resizeTag();
            $('#calendar').fullCalendar('option', 'height', window.innerHeight-70);
            updateDateEditPos();
        });

        window.addEventListener("storage", function(){
            var bgset = localStorage.getItem("bgSetting");
            console.log("Background is changed");

            cfg = readConfig();
            setBackground();
            if(currentNote!== undefined)
            {
                highlightMNote(currentNote);
            }
            else
            {
                highlightMItem($notebooks);
            }

            localStorage.setItem("bgSetting", ""); 
        }, false);

        $chunk.scroll(function(){
            updateDateEditPos();
        });
        $list.scroll(function(){
            updateDateEditPos();
        });

        $bgset.click(function(){
            localStorage.setItem("bgSetting", "");
            win = gui.Window.get();

            new_win = gui.Window.open('setting.html');
        });

        win = gui.Window.get();

        win.on('close', function() {
          this.hide(); // Pretend to be closed already
          saveNote(currentNote);
          writeAppFiles("notes",notebooks);
          console.log("Astar closing ...");
          this.close(true);
        });
    }
    // side -------------------------------------------------------------------
    function addSideMenuEventHandlers()
    {
        $notebooks.click(function(){
            if (currentNote !== undefined){
                closeConfig();
                closeNote();
                hideHeader();
                showGrid();
                addGridEventHandlers();
                setBackground();
            }
        });

        $notebooks.hover(function(){
                $(this).css('background-color',hoverColor);
            },
            function() {
                $(this).css('background-color',"transparent");
            });

        $mnotes.on({
            click: function(){
                var notename;
                notename = $(this).attr('id').slice(5);
                if (notename !== currentNote)
                {
                    closeConfig();
                    closeNote();
                    openNote(notename);
                }
            },
            mouseenter: function () {
                $(this).css('background-color',hoverColor);
            },
            mouseleave: function () {
                $(this).css('background-color',"transparent");
            },
        }, '.m-note');

    }
    
    // grid -------------------------------------------------------------------
    function addGridEventHandlers()
    {
        $oggrid.on('click','.note-cover',function(event){
            if($(this).is(event.target))
            {
                var notename = $(this).closest('li').attr('id').slice(5);
                openNote(notename);
            }
        });

        $newBook.click(function(){
            var note = {};
            var name = "newBook";
            var num = 1;

            if(!isNewBook(name))
            {
                name ="newBook"+"_"+num;
                while(!isNewBook(name))
                {
                    num++;
                    name ="newBook"+"_"+num;
                }
            }
            note = new Notebook(name);
            notebooks[note.name]=note;
            setupSideMenu();
            pushNote(note,"front");
            makeDir(notesPath+"/"+note.name);
           $oggrid.animate({ scrollTop: $oggrid.prop("scrollHeight")}, 300);
        });

        $body.on('click','.note-setting',function(){
            console.log('Open notebook setting ...');
            currentNote = $(this).closest('li').attr('id').slice(5);
            configOn = true;
            hideGrid();
            $setting.html('');
            $setting.fadeIn(300);
            $setting.append('<div class="config-close glyphicon glyphicon-remove"></div>');
            $setting.append('<h1 class="config-title">Configuration</h1><hr>');
            $setting.append('<label class="config-label">General:</label><div>'+'Created: '+notebooks[currentNote].created+'</div><div>'+'Modified: '+notebooks[currentNote].updated+'</div><hr>');
            $setting.append('<label class="config-label">Name:</label><input class="config-name form-control" value="'+notebooks[currentNote].name+'"><hr>');
            $setting.append('<label class="config-label">Background:</label><img class="lg-cover"><input type="file" id="fileDialog"><hr>');
            $setting.append('<label class="config-label">Delete:</label><div class="config-delete">Delete this notebook</div><hr>');
            $setting.find('img').attr('src',notebooks[currentNote].bgimg);

            changeConfigColor();

            $('#fileDialog').change(function(){
                console.log("photo file has been chosen");
                updateImage(this.files[0],currentNote);
            });
            $('.config-name').change(function(){
                var name = $(this).val();
                var temp;
                if(name.length === 0)
                {
                   alert("At least one character is needed.");
                   $(this).val(notebooks[currentNote].name);
                   $(this).focus();
                }
                else if(!/^[a-zA-Z0-9-_]*$/.test(name))
                {
                    alert('There are illegal characters.');
                    $(this).val(notebooks[currentNote].name);
                    $(this).focus();
                }
                else if(isNewBook(name))
                {
                    temp = notebooks[currentNote];
                    temp.name = name;
                    delete notebooks[currentNote];
                    notebooks[name] = temp;
                    notebooks[name].modified = true;
                    $oggrid.find('#note-'+currentNote).attr('id','note-'+name);
                    $(this).blur();
                    renameNote(currentNote,name);
                    renameBgPath(currentNote,name);
                    setupSideMenu();
                    writeAppFiles("notes",notebooks);
                }
                else
                {
                    alert("Name must be unique.");
                    $(this).val(notebooks[currentNote].name);
                    $(this).focus();
                }
            });

            $('.config-delete').click(function(){
                if (confirm("Are you sure you want to delete this notebook: \'"+currentNote+"\"?"))
                {
                    var path = notesPath+"/"+currentNote;
                    delete notebooks[currentNote];
                    deleteFile(path);
                    closeConfig();
                    showGrid();
                    setupSideMenu();
                }
            });
    
            $('.config-close').click(function(){
                closeConfig();
                showGrid();
            });

        });

        $body.on('change','.note-name',function(){
            var name = $(this).val();
            var $note = $(this).closest('.note');
            var notename = $note.attr('id').slice(5);
            var temp;

            if(name.length === 0)
            {
               alert("At least one character is needed.");
               $(this).val(notebooks[notename].name);
               $(this).focus();
            }
            else if(!/^[a-zA-Z0-9-_]*$/.test(name))
            {
                alert('There are illegal characters.');
                $(this).val(notebooks[notename].name);
                $(this).focus();
            }
            else if(isNewBook(name))
            {
                temp = notebooks[notename];
                temp.name = name;
                delete notebooks[notename];
                notebooks[name] = temp;
                notebooks[name].modified = true;
                $note.attr('id','note-'+name);
                $(this).blur();
                renameNote(notename,name);
                renameBgPath(notename,name);
                setupSideMenu();
                writeAppFiles("notes",notebooks);
            }
            else
            {
                alert("Name must be unique.");
                $(this).val(notebooks[notename].name);
                $(this).focus();
            }
        });

    }
    function clearGridEventHandlers()
    {
        $body.unbind();
        $oggrid.unbind();
        $newBook.unbind();
    }

    // setting ----------------------------------------------------------------
    function closeConfig()
    {
        if(configOn)
        {
            console.log("Close notebook setting ...");
            currentNote = undefined;
            $('#fileDialog').unbind();
            $('.config-name').unbind();
            $('.config-close').unbind();
            $('.config-delete').unbind();
            $setting.html('');
            $setting.hide();
            configOn = false;
        }
    }
    function changeConfigColor()
    {
        var colorThief = new ColorThief();
        var colors = colorThief.getPalette($setting.find('img').get(0),2);
        var main = rgbToStr(colors[0]);
        var opposite = gettextColor2(colors[0]);

        $setting.css('color',opposite);
        $setting.find('h1').css('color',rgbToStr(colors[1]));
        $setting.css("background-color",main);
        $('.config-close').css('color',opposite);
    }
    function updateImage(file,notename){
        var reader = new FileReader();
        reader.onload = function(event){
              the_url = event.target.result;
              $('.lg-cover').attr("src",the_url);
              changeConfigColor();

              writeNoteBg(the_url,notename);
          }
          reader.readAsDataURL(file);
    }
    function renameNote(oldname,newname)
    {
        var newPath = notesPath+"/"+newname;
        var oldPath = notesPath+"/"+oldname;
        fs.renameSync(oldPath,newPath);
    }
    function renameBgPath(oldname, newname)
    {
        var bgimg = notebooks[newname].bgimg;
        if(bgimg !== "img/bookcover.jpg")
        {
            notebooks[newname].bgimg = bgimg.replace("/"+oldname+"/","/"+newname+"/");
        }
    }
    function writeNoteBg(data,notename){
        var exts = {
          "image/gif": "gif",
          "image/jpeg": "jpg",
          "image/png": "png",
          "image/tiff": "tif tiff",
          "image/vnd.wap.wbmp": "wbmp",
          "image/x-icon": "ico",
          "image/x-jng": "jng",
          "image/x-ms-bmp": "bmp",
          "image/svg+xml": "svg",
          "image/webp": "webp"
        };
        var path = notesPath+"/"+notename;
        var data_index = data.indexOf('base64') + 7;
        var type = data.slice(5,data_index-8);
        var filedata = data.slice(data_index, data.length);
        var buffer = new Buffer(filedata, 'base64');
        var bgDir = path+"/"+(+new Date)+"."+exts[type];
        mkdirp.sync(path, function (err) {
            if (err) console.error(err)
            else console.log("Making directory: "+path);
        });
        deleteFile(notebooks[notename].bgimg);
        fs.writeFileSync(bgDir, buffer);
        notebooks[notename].bgimg = bgDir;
        notebooks[notename].modified = true;
    };

    // mode -------------------------------------------------------------------
    function initEventHandlers()
    {
        // display type
        $btn.click(function(){
            if (!$(this).hasClass('active'))
            {
                $btn.removeClass('active');
                $(this).addClass('active');

                clearDisplay();
                clearHandlers();

                if($(this).hasClass('bt1'))
                {
                    cfg["disp-type"]="list";
                    addListEventHandlers();
                    console.log("Display-type: list");
                }
                else if($(this).hasClass('bt2'))
                {
                    cfg["disp-type"]="chunk";
                    addChunkEventHandlers();
                    console.log("Display-type: chunk");
                }
                else if($(this).hasClass('bt3'))
                {
                    cfg["disp-type"]="calendar";
                    console.log("Display-type: calendar");
                }
                else
                {
                    console.log("Error: Unknown mode");   
                }
                showSteps();
                writeAppFiles("config",cfg);
            }
        });
        
        // add
        $add.click(function(){
            getStep();
        });

        // tbox
        $tbox.keydown(function( event ){
            if ( event.which == 13 ) {
             getStep();
            }
        });

    }

    function clearBasicHandlers()
    {

        $( ".btn-cal" ).unbind();
        $btn.unbind();
        $add.unbind();
        $tbox.unbind();
    }

    function clearHandlers()
    {

        clearGridEventHandlers();
        detachDateEditor();

        var type = cfg["disp-type"];

        if (type === "list")
        {
            clearListEventHandlers();
        }
        else if(type === "chunk")
        {
            clearChunkEventHandlers();

        }
        else if(type === "calendar")
        {

        }
    }

    function addEventHandlers()
    {
        var type = cfg["disp-type"];
        if (type === "list")
        {
            addListEventHandlers();
        }
        else if(type === "chunk")
        {
            addChunkEventHandlers();

        }
        else if(type === "calendar")
        {

        }
    }
    // list -------------------------------------------------------------------
    function addListEventHandlers()
    {
        $body.on('click','.step',function(){
            var $tr = $(this).closest('tr');
            var index = $tr.index()+1;
            var stepID = $tr.attr('id').slice(5);

            if ($(this).hasClass('marked'))
            {
                $(this).removeClass('marked');
                $('tbody tr:nth-child('+index+')').css("background-color","transparent");
                taskDone--;
                steps[stepID].marked = false;
                if (taskDone < numSteps)
                {
                    $allstep.removeClass('marked');
                }
            }
            else
            {
                $(this).addClass('marked');
                taskDone++;
                steps[stepID].marked = true;
                $('tbody tr:nth-child('+index+')').css("background-color","rgba(0,0,0,0.2)");

                if (taskDone === numSteps)
                {
                    $allstep.addClass('marked');
                }
            }
            notebooks[currentNote].modified = true;
        });

        $body.on('change','.step-title input',function(){
            var $tr = $(this).closest('tr');
            var stepID = $tr.attr('id').slice(5);
            steps[stepID].title = $(this).val();
            $(this).blur();

            notebooks[currentNote].modified = true;
        });

        dateEditorHandler();
    }

    function clearListEventHandlers()
    {
        $allstep.unbind();
        $body.unbind();
        $('html').unbind();
    }

    // chunk ------------------------------------------------------------------
    function addChunkEventHandlers()
    {
        // mark/unmark step
        $body.on('click','.step',function(){

            var $tr = $(this).closest('tr');
            var index = $tr.index()+1;
            var tag = $tr.closest('.tag').attr('id');
            var tagname = tag.slice(4);
            var stepID = $tr.attr('id').slice(5);

            if ($(this).hasClass('marked'))
            {
                $(this).removeClass('marked');
                tags[tagname].marked--;
                steps[stepID].marked = false;
                $('#'+tag+' tbody tr:nth-child('+index+')').css("background-color","transparent");
            }
            else
            {
                $(this).addClass('marked');
                tags[tagname].marked++;
                steps[stepID].marked = true;
                $('#'+tag+' tbody tr:nth-child('+index+')').css("background-color","rgba(0,0,0,0.2)");
            }

            if (tags[tagname].marked >  tags[tagname].steps)
            {
                //$("#"+tag).find('.allstep2').removeClass('marked');
                $("#"+tag).find('.step-bg').hide();
            }
            else
            {
               // $("#"+tag).find('.allstep2').addClass('marked');
                $("#"+tag).find('.step-bg').fadeIn(300);
            }

            notebooks[currentNote].modified = true;
        });

        // remove step from tag
        $body.on('click','.minus',function(){

            var tag = $(this).closest('.tag').attr('id');
            var tagObj = tags[tag.slice(4)];
            var $tag = $("#"+tag);
            var $tr = $(this).closest('tr');
            var index = $tr.index()+1;
            var stepID = $tr.attr('id').slice(5);

            if (!confirm("Are you sure you want to delete the step: \'"+steps[stepID].title+"\"?")) {
                return;
            }

            if (steps[stepID].marked)
            {
                tagObj.marked--;
            }
            numSteps--;
            tagObj.steps--;
            delete steps[stepID];
            delete tagObj.stepIDs[index];
            $tr.remove();

            notebooks[currentNote].modified = true;
        });

        // add step into tag
        $body.on('click','.plus',function(){
            var $tag = $(this).closest('.tag');
            var $wrapper = $tag.find('.table-wrapper');
            var tagName = $tag.attr('id').slice(4);
            var tagObj = tags[tagName];

            steps[sid] = new Step(sid,"new title",tagName);
            pushStep(steps[sid]);
            tagObj.stepIDs.push(sid);
            numSteps++;
            sid++;

            $wrapper.animate({scrollTop:$wrapper.prop("scrollHeight")}, 300);
            notebooks[currentNote].modified = true;
        });

        $body.on('change','.step-title input',function(){
            var $tr = $(this).closest('tr');
            var stepID = $tr.attr('id').slice(5);
            steps[stepID].title = $(this).val();
            $(this).blur();
            notebooks[currentNote].modified = true;
        });

        // tag color editor
        $body.on('change','.colorpicker',function(){
            var tag = $(this).closest('.tag').attr('id');
            var tagName = tag.slice(4);
            var color = $(this).val();
            tags[tagName].color = color;
            $("#"+tag+" .tagname").css('background-color',color);
            $("#"+tag+" .tagname").css('color',gettextColor(hexToRgb(color)));

            for (ctr = 0; ctr < tags[tagName].steps; ctr++)
            {
                steps[tags[tagName].stepIDs[ctr]].color = color;
                steps[tags[tagName].stepIDs[ctr]].textColor = gettextColor(hexToRgb(color));
            }
            notebooks[currentNote].modified = true;
        });

        $body.on('change','.edit-tagname',function(){
            var name = $(this).val();
            var $tag = $(this).closest('.tag');
            var tagname = $tag.attr('id').slice(4);
            var temp;
            if(name.length === 0)
            {
               alert("At least one character is needed.");
               $(this).val(tags[tagname].name);
               $(this).focus();
            }
            else if(!/^[a-zA-Z0-9-_]*$/.test(name))
            {
                alert('There are illegal characters.');
                $(this).val(tags[tagname].name);
                $(this).focus();
            }
            else if(isNewTag(name))
            {
                temp = tags[tagname];
                temp.name = name;
                for(ctr = 0; ctr < tags[tagname].steps; ctr++)
                {
                     steps[temp.stepIDs[ctr]].tag = name;
                }
                delete tags[tagname];
                tags[name] = temp;
                $tag.attr('id',"tag-"+name);
                $(this).blur();
                notebooks[currentNote].modified = true;
            }
            else
            {
                alert("Name must be unique.");
                $(this).val(tags[tagname].name);
                $(this).focus();
            }
        });

        $newTag.click(function(){
            var name = "newtag";
            var num = 1;

            if(!isNewTag(name))
            {
                name ="newtag"+"_"+num;
                while(!isNewTag(name))
                {
                    num++;
                    name ="newtag"+"_"+num;
                }
            }
           tags[name] = new Tag(name);
           pushTag(tags[name]);
           resizeTag();
           $chunk.animate({ scrollTop: $chunk.prop("scrollHeight")}, 300);
           notebooks[currentNote].modified = true;
        });

        // date editor
        dateEditorHandler();
    }

    function clearChunkEventHandlers()
    {
        $body.unbind();
        $main.unbind();
        $chunk.unbind();
        $('html').unbind();
        $newTag.unbind();
    }


    // date editor ****************************************************************
    function updateDateEditPos()
    {
        if(dateEditOn)
        {
            var stepID = $dateEditor.attr('id');
            var offset = $('#step-'+stepID+" .step-date").offset();
            $dateEditor.css('top',offset.top+30);
            $dateEditor.css('left',offset.left-200);
        }
    }

    function detachDateEditor()
    {
        $dateEditor.remove();
        $dateEditor.unbind();
        $('.edit-month').unbind();
        $('.edit-time').unbind();
        dateEditOn = false;
    }

    function dateEditorHandler()
    {
        // date editor handler
        $body.on('click','.step-date',function(){

            var $tr = $(this).closest('tr');
            var offset = $(this).offset();
            var stepID = $tr.attr('id').slice(5);
            var allDay,toDo;
            var start,end,startTime,endTime;

            console.log($dateEditor.attr('id'));

            if(dateEditOn && stepID === $dateEditor.attr('id'))
            {
                detachDateEditor();
                return;
            }
            detachDateEditor();

            dateEditOn = true;
            allDay = steps[stepID].allDay;
            toDo = steps[stepID].toDo;
            start = formatDate(steps[stepID].start);
            end = formatDate(steps[stepID].end);
            startTime = formatTime(steps[stepID].start);
            endTime = formatTime(steps[stepID].end);

            $body.append('<div id="'+stepID+'" class="date-edit"><div id="check-todo" class="checkbox"><label><input type="checkbox" value="">todo</label></div><div id="check-allday" class="checkbox"><label><input type="checkbox" value="">all-day</label></div><hr class="h-line"><input id="start-month" class="edit-month" type="text" value="'+start+'"  maxlength="8"><input id="start-time" class="edit-time" type="text" value="'+startTime+'" maxlength="5" disabled>to<input id="end-month" class="edit-month" type="text" value="'+end+'" maxlength="8"><input id="end-time" class="edit-time" type="text" value="'+endTime+'" maxlength="5" disabled></div>');
            $dateEditor = $('.date-edit');
            $dateEditor.css('top',offset.top+30);
            $dateEditor.css('left',offset.left-200);

            if (allDay)
            {
                $dateEditor.find('#check-allday input').prop( "checked", true );
            }
            else
            {
                $dateEditor.find('.edit-time').prop('disabled', false);
            }

            if(toDo)
            {
                $dateEditor.find('#check-todo input').prop( "checked", true );
                $dateEditor.find('#check-allday input').prop( "disabled", true );
                $dateEditor.find('.edit-month').prop('disabled', true);
                $dateEditor.find('.edit-time').prop('disabled', true);
            }

            // date picker
            $('.edit-month').datepicker({
                dateFormat: "m/d/y",
            });

            // todo checkbox handler
            $dateEditor.find('#check-todo input').click(function(){
                var stepID = $(this).closest('.date-edit').attr('id');
                var m;

                if($(this).is(':checked'))
                {
                    steps[stepID].toDo = true;
                    $dateEditor.find('#check-allday input').prop( "disabled", true );
                    $dateEditor.find('.edit-month').prop('disabled', true);
                    $dateEditor.find('.edit-time').prop('disabled', true);
                    steps[stepID].start = "2099-01-01";
                }
                else
                {
                    steps[stepID].toDo = false;
                    $dateEditor.find('#check-allday input').prop( "disabled", false );
                    $dateEditor.find('.edit-month').prop('disabled', false);
                    if(!steps[stepID].allDay)
                    {
                        $dateEditor.find('.edit-time').prop('disabled', false);
                    }
                    steps[stepID].start = moment().format("YYYY-MM-DD");
                    steps[stepID].end = moment().add(1,'days').format("YYYY-MM-DD");
                    $('#start-month').val(formatDate(steps[stepID].start));
                    $('#end-month').val(formatDate(steps[stepID].end));
                }
                updateDateField(stepID);
                notebooks[currentNote].modified = true;
            });

            // allday checkbox handler
            $dateEditor.find('#check-allday input').click(function(){
                var stepID = $(this).closest('.date-edit').attr('id');

                if($(this).is(':checked'))
                {
                    steps[stepID].allDay = true;
                    $dateEditor.find('.edit-time').prop('disabled', true);

                    m = moment(formatDate(steps[stepID].start)+" "+"00:00","M/D/Y HH:mm");
                    steps[stepID].start = m.format("YYYY-MM-DD HH:mm");
                    steps[stepID].end = m.add(1,'days').format("YYYY-MM-DD HH:mm");
                    $('#end-month').val(formatDate(steps[stepID].end));
                    $('#start-time').val("00:00");
                    $('#end-time').val("00:00");
                }
                else
                {
                    steps[stepID].allDay = false;
                    $dateEditor.find('.edit-time').prop('disabled', false);

                    m = moment(formatDate(steps[stepID].start)+" "+"12:00","M/D/Y HH:mm");
                    steps[stepID].start = m.format("YYYY-MM-DD HH:mm");
                    steps[stepID].end = m.add(1,'hours').format("YYYY-MM-DD HH:mm");
                    $('#end-month').val(formatDate(steps[stepID].end));
                    $('#start-time').val("12:00");
                    $('#end-time').val("13:00");
                }
                updateDateField(stepID);
                notebooks[currentNote].modified = true;
            });

            // month edit handler
            $('.edit-month').change(function(){
                var value = $(this).val();
                var stepId = $(this).closest('.date-edit').attr('id');
                var time,m;

                if(!moment(value,"M/D/Y").isValid())
                {
                    console.log("Invalid date input: "+value);
                    return;
                }

                if(steps[stepID].allDay)
                {
                    time =  "00:00";
                }
                else
                {
                    if ($(this).attr('id') === 'start-month')
                    {
                        time =  formatTime(steps[stepID].start);
                    }
                    else
                    {
                        time =  formatTime(steps[stepID].end);
                    }
                }

                m = moment(value+" "+time,"M/D/Y HH:mm");

                if ($(this).attr('id') === 'start-month')
                {
                    if (m >=  moment(steps[stepID].end))
                    {
                        steps[stepID].start = m.format("YYYY-MM-DD HH:mm");
                        steps[stepID].end = m.add(1,'days').format("YYYY-MM-DD HH:mm");

                        $('#end-month').val(formatDate(steps[stepID].end));
                    }
                    else
                    {
                        steps[stepID].start = moment(value,"M/D/Y").format("YYYY-MM-DD HH:mm");
                    }
                }
                else
                {
                    if (m <=  moment(steps[stepID].start))
                    {
                        steps[stepID].end = m.format("YYYY-MM-DD HH:mm");
                        steps[stepID].start = m.subtract(1,'days').format("YYYY-MM-DD HH:mm");

                        $('#start-month').val(formatDate(steps[stepID].start));
                    }
                    else
                    {
                        steps[stepID].end = moment(value,"M/D/Y").format("YYYY-MM-DD HH:mm");
                    }
                }

                // console.log(steps[stepID].start);
                // console.log(steps[stepID].end);
                
                $(this).datepicker("hide");
                updateDateField(stepID);
                notebooks[currentNote].modified = true;
            });

            // time edit handler
            $('.edit-time').change(function(){
                var value = $(this).val();
                var re = /^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
                var date,m,diff,start,end;

                if(!re.test(value))
                {
                    return;
                }

                start = moment(steps[stepID].start);
                end = moment(steps[stepID].end);
                diff = start.diff(end,'hours');

                if ($(this).attr('id') === 'start-time')
                {
                    date =  steps[stepID].start;
                    m = moment(formatDate(date)+" "+value,"M/D/Y HH:mm");
                    
                    if (m >=  end)
                    {
                        steps[stepID].start = m.format("YYYY-MM-DD HH:mm");
                        steps[stepID].end = m.add(diff,'hours').format("YYYY-MM-DD HH:mm");

                        $('#end-time').val(formatTime(steps[stepID].end));
                    }
                    else
                    {
                        steps[stepID].start = moment(value,"M/D/Y").format("YYYY-MM-DD HH:mm");
                    }
                }
                else
                {
                    date =  steps[stepID].end;
                    m = moment(formatDate(date)+" "+value,"M/D/Y HH:mm");
                    if (m <= start)
                    {
                        steps[stepID].end = m.format("YYYY-MM-DD HH:mm");
                        steps[stepID].start = m.subtract(diff,'hours').format("YYYY-MM-DD HH:mm");

                        $('#start-time').val(formatTime(steps[stepID].start));
                    }
                    else
                    {
                        steps[stepID].end = moment(value,"M/D/Y").format("YYYY-MM-DD HH:mm");
                    }
                }


                notebooks[currentNote].modified = true;
                
            });

        });

        // remove when the user clicks outside of specific objects
        $('html').click(function(event){
            if(dateEditOn)
            {
                if( !$dateEditor.is(event.target) && $dateEditor.has(event.target).length === 0 
                    && !$('.step-date').is(event.target) && !$('.ui-datepicker').is(event.target) 
                    && $('.ui-datepicker').has(event.target).length === 0 && !$(event.target).is('.ui-icon'))
                {
                    detachDateEditor();
                }
            }
        });
    }
    
    // return values **********************************************************
    return {
        start : start
    }

})();