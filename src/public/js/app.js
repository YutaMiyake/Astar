    
    // initializations/declarations *************************************
    var gui = require('nw.gui');
    var fs = require('fs');
    var path = require('path');
    var process = require('process');
    var mkdirp = require('mkdirp');
    var rimraf = require('rimraf');

    var dataPath = gui.App.dataPath;
    var cfgPath = path.join(dataPath,"/config");
    var notesPath  = path.join(dataPath,"/notebooks");


    // functions *******************************************************
    function isValidConfig(cfgObj)
    {
        if (cfgObj === 'undefined')
        {
            return false;
        }
        return Object.keys(cfgObj).length === 6; // for now
    }

    function initConfig()
    {
        var cfg = {
            "bg-type":"color",
            "bg-path":"na",
            "bg-color":"#f2f2f2",
            "disp-type":"list",
            "step-path":"steps.json",
            "tag-path":"tags.json",
        };
        return cfg;
    }

    function readConfig()
    {
        var cfg = {};
        if (!fs.existsSync(cfgPath))
        {
            console.log(cfgPath+"is not found");
            fs.mkdir(cfgPath);
            cfg = initConfig();
            writeAppFiles("config",cfg);
        }
        else
        {
            if(!fs.existsSync(cfgPath+'/config.json'))
            {
                console.log(cfgPath+'/config.json'+"is not found");
                cfg = initConfig();
                writeAppFiles("config",cfg);
            }
            else
            {
                var data = fs.readFileSync(cfgPath+'/config.json');
                cfg = JSON.parse(data);
                if (!isValidConfig(cfg))
                {
                    cfg = initConfig();
                }
            }
        }
        return cfg;
    }
    function readAppFiles(filetype,note)
    {
        var obj = {};
        var data,path,filePath;

        if(filetype === "notes")
        {
            path = notesPath;
            filePath = notesPath + "/notes.json";
        }
        else if(filetype === "steps" && note !== undefined)
        {
            path = notesPath+"/"+note;
            filePath = path+"/steps.json";
        }
        else if(filetype === "tags" && note !== undefined)
        {
            path = notesPath+"/"+note;
            filePath = path+"/tags.json";
        }
        else
        {
            path = null;
            console.log("Reading file error: Unknown file type.");
        }

        if(path !== null)
        {
          console.log("Reading "+filetype+" ...");
          if(fs.existsSync(filePath))
          {
            data = fs.readFileSync(filePath);
            obj = JSON.parse(data);
          }
          else
          {
            console.log(filePath+" is not found");
          }
        }
        return obj;
    }

    function writeAppFiles(filetype,obj,note)
    {
        var data,path,filePath;

        if(filetype === "config")
        {
            path = cfgPath;
            filePath = cfgPath + '/config.json';
        }
        else if(filetype === "notes")
        {
            path = notesPath;
            filePath = notesPath + '/notes.json';
        }
        else if(filetype === "steps" && note !== undefined)
        {
            path = notesPath+"/"+note;
            filePath = path+"/steps.json";
        }
        else if(filetype === "tags" && note !== undefined)
        {
            path = notesPath+"/"+note;
            filePath = path+"/tags.json";
        }
        else
        {
            path = null;
            console.log("Writing file error: Unknown file type.");
        }

        if(path !== null)
        {
          console.log("Writing "+filetype+" ...");
          data = JSON.stringify(obj);

          mkdirp.sync(path, function (err) {
              if (err) console.error(err)
              else console.log("Making directory: "+path);
          });
          fs.writeFileSync(filePath, data);
        }
    }

    function makeDir(path)
    {
        if(!fs.existsSync(path))
        {
            mkdirp.sync(path, function (err) {
                if (err) console.error(err)
                else console.log("Making directory: "+path);
            });
        }
    }

    function deleteFile(path)
    {
        console.log("Removing "+path+" ...");
        rimraf(path,function(){
            console.log(path+" is removed.");
        });
    }
