/*
<javascriptresource>
<name>$$$/JavaScripts/fnykis-berglund/Menu=Berglund...</name>
<about>$$$/JavaScripts/fnykis-berglund/About=Transfer of paths, channels and raster layers to another document.^r^rCopyright 2021 Fnykis</about>
<category>Fnykis</category> 
</javascriptresource>
*/

////////////////////////////////////////////////////////////////////////
////    
////    BERGLUND v0.1.2
////    by Fnykis
////    https://github.com/Fnykis
////    ---------
////    This code is protected by GNU GPLv3
////    https://www.gnu.org/licenses/gpl-3.0
////
////////////////////////////////////////////////////////////////////////

// #target photoshop
var scriptName = $.fileName.substring($.fileName.lastIndexOf("/") + 1, $.fileName.lastIndexOf(".")); // The location of this script
var scriptFolder = (new File($.fileName)).parent; // The location of this script

// VARIABLES

var timeStart = null;
var filesListSource;
var namesListSource = [];
var filesListDestination;
var namesListDestination = [];
var notFound = [];
var processedFiles = 0;
var errorList = ["Errors:"];

var itemName, skipItem, matchingLayer;

var settings = {
    "paths": 0,
    "paths_match": "",
    "paths_originalNaming": true,
    "paths_customName": "",
    "paths_existing": 0,
    "paths_suffix": "_new",
    "channels": 0,
    "channels_match": "",
    "channels_originalNaming": true,
    "channels_customName": "",
    "channels_existing": 0,
    "channels_suffix": "_new",
    "rasters": 0,
    "rasters_match": "",
    "rasters_originalNaming": true,
    "rasters_customName": "",
    "rasters_existing": 0,
    "rasters_suffix": "_new",
    "pathSource": "",
    "pathDestination": ""
}

try {
    init();
} catch(e) {
    var timeFull = timeSinceStart(timeStart);
    if (timeFull != null) alert("Error code " + e.number + " (line " + e.line + "):\n" + e + "\n\nTime elapsed " + formatSeconds(timeFull));
}

function createDialog() {
    try {
    
    var w = new Window('dialog',"Berglund",undefined);
        w.alignChildren = "left";
        w.orientation = "column";

        var grp_Source = w.add("group");
            grp_Source.orientation = "row";
            grp_Source.alignment = "left";

            var btn_Source = grp_Source.add ("button",[0,0,137,35],"Source...");
                btn_Source.alignment = "bottom";
                
            var txt_arrow = grp_Source.add("statictext", [0,0,60,50], "\u219D");
                txt_arrow.graphics.font = "Verdana:40";
                txt_arrow.justify = "center";
                txt_arrow.alignment = "top";
                
            var btn_Destination = grp_Source.add ("button",[0,0,137,35],"Destination...");
                btn_Destination.alignment = "bottom";

        var txt_fileStatus = w.add("statictext", [0,0,355,30], "No files selected");
            txt_fileStatus.justify = "center";

        var panel_tabs = w.add("tabbedpanel");
            panel_tabs.alignChildren = "left";

            var tab_paths = panel_tabs.add("tab", undefined, "Paths");
                tab_paths.alignChildren = "left";

                var drop_pathsRuling = tab_paths.add ("dropdownlist", [0,0,290,30], ["Transfer all found", "Transfer only name match", "Transfer none"]);
                    drop_pathsRuling.selection = 0;

                var grp_paths = tab_paths.add("group");
                    grp_paths.alignChildren = "left";
                    grp_paths.orientation = "column";

                    var grp_pathsMatch = grp_paths.add("group");
                        grp_pathsMatch.alignChildren = "left";
                        grp_pathsMatch.orientation = "row";

                        var txt_pathsMatch = grp_pathsMatch.add("statictext", [0,0,140,20], "Match:");
                            txt_pathsMatch.justify = "right";
                        var edit_pathsMatch = grp_pathsMatch.add("edittext", [0,0,140,25], "");

                    grp_paths.add("statictext", [0,0,270,20], "Name of transferred items:");

                    var grp_pathsName = grp_paths.add("group");
                        grp_pathsName.alignChildren = "left";
                        grp_pathsName.orientation = "row";

                        radio_pathsNameOriginal = grp_pathsName.add("radiobutton", [0,0,140,20], "Original name");
                        radio_pathsNameCustom = grp_pathsName.add("radiobutton", [0,0,140,20], "Custom name");
                        radio_pathsNameOriginal.value = true;

                    var grp_pathsNameCustom = grp_paths.add("group");
                        grp_pathsNameCustom.alignChildren = "left";
                        grp_pathsNameCustom.orientation = "row";

                        grp_pathsNameCustom.add("statictext", [0,0,140,20], "");
                        edit_pathsNameCustom = grp_pathsNameCustom.add("edittext", [0,0,140,25], "");
                        grp_pathsNameCustom.enabled = false;

                    var grp_pathsExist = grp_paths.add("group");
                        grp_pathsExist.alignChildren = "left";
                        grp_pathsExist.orientation = "column";

                        grp_pathsExist.add("statictext", [0,0,280,20], "What to do with colliding paths:");
                        var drop_pathsExist = grp_pathsExist.add ("dropdownlist", [0,0,290,30], ["Add suffix if name match", "Replace if name match", "Replace all existing (leaves only the transferred paths)", "Stop and ask", "Keep both (will show native prompt)", "Skip"]);
                            drop_pathsExist.selection = 0;

                        var grp_pathsSuffix = grp_paths.add("group");
                            grp_pathsSuffix.alignChildren = "left";
                            grp_pathsSuffix.orientation = "row";
    
                            var txt_pathsSuffix = grp_pathsSuffix.add("statictext", [0,0,140,20], "Suffix:");
                                txt_pathsSuffix.justify = "right";
                            edit_pathsSuffix = grp_pathsSuffix.add("edittext", [0,0,140,25], "_new");

            var tab_channels = panel_tabs.add("tab", undefined, "Channels");
                tab_channels.alignChildren = "left";

                var drop_channelsRuling = tab_channels.add ("dropdownlist", [0,0,290,30], ["Transfer all found (except standard channels)", "Transfer only name match", "Transfer none"]);
                    drop_channelsRuling.selection = 0;

                var grp_channels = tab_channels.add("group");
                    grp_channels.alignChildren = "left";
                    grp_channels.orientation = "column";

                    var grp_channelsMatch = grp_channels.add("group");
                        grp_channelsMatch.alignChildren = "left";
                        grp_channelsMatch.orientation = "row";

                        var txt_channelsMatch = grp_channelsMatch.add("statictext", [0,0,140,20], "Match:");
                            txt_channelsMatch.justify = "right";
                        var edit_channelsMatch = grp_channelsMatch.add("edittext", [0,0,140,25], "");

                    grp_channels.add("statictext", [0,0,270,20], "Name of transferred items:");

                    var grp_channelsName = grp_channels.add("group");
                        grp_channelsName.alignChildren = "left";
                        grp_channelsName.orientation = "row";

                        radio_channelsNameOriginal = grp_channelsName.add("radiobutton", [0,0,140,20], "Original name");
                        radio_channelsNameCustom = grp_channelsName.add("radiobutton", [0,0,140,20], "Custom name");
                        radio_channelsNameOriginal.value = true;

                    var grp_channelsNameCustom = grp_channels.add("group");
                        grp_channelsNameCustom.alignChildren = "left";
                        grp_channelsNameCustom.orientation = "row";

                        grp_channelsNameCustom.add("statictext", [0,0,140,20], "");
                        edit_channelsNameCustom = grp_channelsNameCustom.add("edittext", [0,0,140,25], "");
                        grp_channelsNameCustom.enabled = false;

                    var grp_channelsExist = grp_channels.add("group");
                        grp_channelsExist.alignChildren = "left";
                        grp_channelsExist.orientation = "column";

                        grp_channelsExist.add("statictext", [0,0,280,20], "What to do with colliding channels:");
                        var drop_channelsExist = grp_channelsExist.add ("dropdownlist", [0,0,290,30], ["Add suffix if name match", "Replace if name match", "Replace all existing (leaves only the transferred paths)", "Stop and ask", "Keep both (will show native prompt)", "Skip"]);
                            drop_channelsExist.selection = 0;

                        var grp_channelsSuffix = grp_channels.add("group");
                            grp_channelsSuffix.alignChildren = "left";
                            grp_channelsSuffix.orientation = "row";
    
                            var txt_channelsSuffix = grp_channelsSuffix.add("statictext", [0,0,140,20], "Suffix:");
                                txt_channelsSuffix.justify = "right";
                            edit_channelsSuffix = grp_channelsSuffix.add("edittext", [0,0,140,25], "_new");
		
            var tab_rasters = panel_tabs.add("tab", undefined, "Raster layer");
                tab_rasters.alignChildren = "left";

                var drop_rastersRuling = tab_rasters.add ("dropdownlist", [0,0,290,30], ["Transfer all found (except Background)", "Transfer only name match", "Transfer none"]);
                    drop_rastersRuling.selection = 0;

                var grp_rasters = tab_rasters.add("group");
                    grp_rasters.alignChildren = "left";
                    grp_rasters.orientation = "column";

                    var grp_rastersMatch = grp_rasters.add("group");
                        grp_rastersMatch.alignChildren = "left";
                        grp_rastersMatch.orientation = "row";

                        var txt_rastersMatch = grp_rastersMatch.add("statictext", [0,0,140,20], "Match:");
                            txt_rastersMatch.justify = "right";
                        var edit_rastersMatch = grp_rastersMatch.add("edittext", [0,0,140,25], "");

                    grp_rasters.add("statictext", [0,0,270,20], "Name of transferred items:");

                    var grp_rastersName = grp_rasters.add("group");
                        grp_rastersName.alignChildren = "left";
                        grp_rastersName.orientation = "row";

                        radio_rastersNameOriginal = grp_rastersName.add("radiobutton", [0,0,140,20], "Original name");
                        radio_rastersNameCustom = grp_rastersName.add("radiobutton", [0,0,140,20], "Custom name");
                        radio_rastersNameOriginal.value = true;

                    var grp_rastersNameCustom = grp_rasters.add("group");
                        grp_rastersNameCustom.alignChildren = "left";
                        grp_rastersNameCustom.orientation = "row";

                        grp_rastersNameCustom.add("statictext", [0,0,140,20], "");
                        edit_rastersNameCustom = grp_rastersNameCustom.add("edittext", [0,0,140,25], "");
                        grp_rastersNameCustom.enabled = false;

                    var grp_rastersExist = grp_rasters.add("group");
                        grp_rastersExist.alignChildren = "left";
                        grp_rastersExist.orientation = "column";

                        grp_rastersExist.add("statictext", [0,0,280,20], "What to do with colliding raster layers:");
                        var drop_rastersExist = grp_rastersExist.add ("dropdownlist", [0,0,290,30], ["Add suffix if name match", "Replace if name match", "Stop and ask", "Keep both (will show native prompt)", "Skip"]);
                            drop_rastersExist.selection = 0;

                        var grp_rastersSuffix = grp_rasters.add("group");
                            grp_rastersSuffix.alignChildren = "left";
                            grp_rastersSuffix.orientation = "row";
    
                            var txt_rastersSuffix = grp_rastersSuffix.add("statictext", [0,0,140,20], "Suffix:");
                                txt_rastersSuffix.justify = "right";
                            edit_rastersSuffix = grp_rastersSuffix.add("edittext", [0,0,140,25], "_new");

                var chk_rastersAction = tab_rasters.add("checkbox", [0,0,140,25],"Run action after transfer");
                var drop_rastersActionGroup = tab_rasters.add("dropdownlist", [0,0,290,30], undefined);
                var drop_rastersActions = tab_rasters.add("dropdownlist", [0,0,290,30], undefined);
		
        var grp_Btn = w.add("group");
            grp_Btn.orientation = "row";
            grp_Btn.alignment = "right";
            
            var btn_defaults = grp_Btn.add("button", [0,0,90,30],"Defaults");
            txt_spacer = grp_Btn.add("statictext", [0,0,60,30],"");
            var btn_OK = grp_Btn.add("button", [0,0,90,30],"OK");
                btn_OK.enabled = false;
            var btn_Close = grp_Btn.add("button", [0,0,90,30],"Cancel");
    
    btn_OK.onClick = function() {
        if (checkSettings() === true) w.close();
    }
    btn_defaults.onClick = function() {
        settings = {
            "paths": 0,
            "paths_match": "",
            "paths_originalNaming": true,
            "paths_customName": "",
            "paths_existing": 0,
            "paths_suffix": "_new",
            "channels": 0,
            "channels_match": "",
            "channels_originalNaming": true,
            "channels_customName": "",
            "channels_existing": 0,
            "channels_suffix": "_new",
            "rasters": 0,
            "rasters_match": "",
            "rasters_originalNaming": true,
            "rasters_customName": "",
            "rasters_existing": 0,
            "rasters_suffix": "_new",
            "pathSource": "",
            "pathDestination": ""
        }
        fillElements();
        checkElements();
        settings.pathSource = app.getCustomOptions("berglund").getString(18);
        settings.pathDestination = app.getCustomOptions("berglund").getString(19);
    }

    try {
        settings.pathSource = app.getCustomOptions("berglund").getString(18);
        settings.pathDestination = app.getCustomOptions("berglund").getString(19);

        settings.paths = app.getCustomOptions("berglund").getInteger(0);
        settings.paths_match = app.getCustomOptions("berglund").getString(1);
        settings.paths_originalNaming = app.getCustomOptions("berglund").getBoolean(2);
        settings.paths_customName = app.getCustomOptions("berglund").getString(3);
        settings.paths_existing = app.getCustomOptions("berglund").getInteger(4);
        settings.paths_suffix = app.getCustomOptions("berglund").getString(5);

        settings.channels = app.getCustomOptions("berglund").getInteger(6);
        settings.channels_match = app.getCustomOptions("berglund").getString(7);
        settings.channels_originalNaming = app.getCustomOptions("berglund").getBoolean(8);
        settings.channels_customName = app.getCustomOptions("berglund").getString(9);
        settings.channels_existing = app.getCustomOptions("berglund").getInteger(10);
        settings.channels_suffix = app.getCustomOptions("berglund").getString(11);

        settings.rasters = app.getCustomOptions("berglund").getInteger(12);
        settings.rasters_match = app.getCustomOptions("berglund").getString(13);
        settings.rasters_originalNaming = app.getCustomOptions("berglund").getBoolean(14);
        settings.rasters_customName = app.getCustomOptions("berglund").getString(15);
        settings.rasters_existing = app.getCustomOptions("berglund").getInteger(16);
        settings.rasters_suffix = app.getCustomOptions("berglund").getString(17);
    } catch(e) {
        // No settings saved yet
    }

    panel_tabs.selection = 0;
    if (settings.paths == 2) panel_tabs.selection = 1;
    if (settings.channels == 2) panel_tabs.selection = 2;

    fillElements();
    checkElements();

    // onClicks and buttons
    drop_pathsRuling.onChange = 
    radio_pathsNameOriginal.onClick = 
    radio_pathsNameCustom.onClick = 
    drop_pathsExist.onChange = 
    drop_channelsRuling.onChange = 
    radio_channelsNameOriginal.onClick = 
    radio_channelsNameCustom.onClick = 
    drop_channelsExist.onChange = 
    drop_rastersRuling.onChange = 
    radio_rastersNameOriginal.onClick = 
    radio_rastersNameCustom.onClick = 
    drop_rastersExist.onChange = 
    function() {
        checkElements();
    }

    
    btn_Source.onClick = btn_Destination.onClick = function() {

        if (this.text.toLowerCase().indexOf("source") != -1) {

            var selectedFiles = selectFiles(settings.pathSource, "Select source files");
            if (selectedFiles != null) {

                filesListSource = selectedFiles;
                namesListSource = [];
                for (i = 0; i < selectedFiles.length; i++) {
                    var item = String(selectedFiles[i]);
                    namesListSource.push(item.substring(item.lastIndexOf("/") + 1, item.lastIndexOf(".")));
                }
                
                settings.pathSource = item.substring(0, item.lastIndexOf("/"));
                var desc = new ActionDescriptor();
                    desc.putString(18, settings.pathSource);
                    desc.putString(19, settings.pathDestination);
                app.putCustomOptions("berglund", desc);

                filesListSource.sort();
                namesListSource.sort();
                var typeText = "source";

            }

        } else {

            var selectedFiles = selectFiles(settings.pathDestination, "Select destination files");
            if (selectedFiles != null) {

                filesListDestination = selectedFiles;
                namesListDestination = [];
                for (i = 0; i < selectedFiles.length; i++)  {
                    var item = String(selectedFiles[i]);
                    namesListDestination.push(item.substring(item.lastIndexOf("/") + 1, item.lastIndexOf(".")));
                }
                
                settings.pathDestination = item.substring(0, item.lastIndexOf("/"));
                var desc = new ActionDescriptor();
                    desc.putString(18, settings.pathSource);
                    desc.putString(19, settings.pathDestination);
                app.putCustomOptions("berglund", desc);

                filesListDestination.sort();
                namesListDestination.sort();
                var typeText = "destination";

            }
        }
        
        if (filesListSource === undefined || filesListDestination === undefined) {
            if (selectedFiles.length > 1) {
                txt_fileStatus.text = selectedFiles.length + " " + typeText + " files selected";
            } else {
                txt_fileStatus.text = "1 " + typeText + " file selected";
            }
        } else {
            if (!isEqual(namesListSource, namesListDestination)) {
                txt_fileStatus.text = "The file names do not match!";
                btn_OK.enabled = false;
            } else {
                if (namesListSource.length == 1) {
                    txt_fileStatus.text = "The two file names match!";
                } else {
                    txt_fileStatus.text = "The " + (namesListSource.length * 2) + " file names match!";
                }
                btn_OK.enabled = true;
            }
        }
        
    }

    // Show the window
    w.center();
    x = w.show();

    return x;

    function checkElements() {
        grp_pathsNameCustom.enabled = radio_pathsNameCustom.value;
        if (drop_pathsRuling.selection == 1) {
            grp_paths.enabled = true;
            grp_pathsMatch.enabled = true;
        } else if (drop_pathsRuling.selection == 2) {
            grp_paths.enabled = false;
        } else {
            grp_paths.enabled = true;
            grp_pathsMatch.enabled = false
        }
        if (drop_pathsExist.selection == 0) {
            grp_pathsSuffix.enabled = true;
        } else {
            grp_pathsSuffix.enabled = false;
        }

        grp_channelsNameCustom.enabled = radio_channelsNameCustom.value;
        if (drop_channelsRuling.selection == 1) {
            grp_channels.enabled = true;
            grp_channelsMatch.enabled = true;
        } else if (drop_channelsRuling.selection == 2) {
            grp_channels.enabled = false;  
        } else {
            grp_channels.enabled = true;
            grp_channelsMatch.enabled = false
        }
        if (drop_channelsExist.selection == 0) {
            grp_channelsSuffix.enabled = true;
        } else {
            grp_channelsSuffix.enabled = false;
        }

        grp_rastersNameCustom.enabled = radio_rastersNameCustom.value;
        if (drop_rastersRuling.selection == 1) {
            grp_rasters.enabled = true;
            grp_rastersMatch.enabled = true;
        } else if (drop_rastersRuling.selection == 2) {
            grp_rasters.enabled = false;  
        } else {
            grp_rasters.enabled = true;
            grp_rastersMatch.enabled = false
        }
        if (drop_rastersExist.selection == 0) {
            grp_rastersSuffix.enabled = true;
        } else {
            grp_rastersSuffix.enabled = false;
        }
    }

    function fillElements() {
        // chk_paths.value = settings.paths;
        drop_pathsRuling.selection = settings.paths;
        edit_pathsMatch.text = settings.paths_match;
        radio_pathsNameOriginal.value = settings.paths_originalNaming;
        radio_pathsNameCustom.value = !settings.paths_originalNaming;
        edit_pathsNameCustom.text = settings.paths_customName;
        drop_pathsExist.selection = settings.paths_existing;
        edit_pathsSuffix.text = settings.paths_suffix;
        
        // chk_channels.value = settings.channels;
        drop_channelsRuling.selection = settings.channels;
        edit_channelsMatch.text = settings.channels_match;
        radio_channelsNameOriginal.value = settings.channels_originalNaming;
        radio_channelsNameCustom.value = !settings.channels_originalNaming;
        edit_channelsNameCustom.text = settings.channels_customName;
        drop_channelsExist.selection = settings.channels_existing;
        edit_channelsSuffix.text = settings.channels_suffix;
        
        // chk_rasters.value = settings.rasters;
        drop_rastersRuling.selection = settings.rasters;
        edit_rastersMatch.text = settings.rasters_match;
        radio_rastersNameOriginal.value = settings.rasters_originalNaming;
        radio_rastersNameCustom.value = !settings.rasters_originalNaming;
        edit_rastersNameCustom.text = settings.rasters_customName;
        drop_rastersExist.selection = settings.rasters_existing;
        edit_rastersSuffix.text = settings.rasters_suffix;
    }

    function checkSettings(ignoreAlerts) {
        
        // If something has to be checked before closing the window, do it here and return false if faulty
        
        if (!ignoreAlerts) {
            //   alert("The check is checked!");
        }

        // Global variables
        // settings.paths = chk_paths.value;
        settings.paths = drop_pathsRuling.selection.index;
        settings.paths_match = edit_pathsMatch.text;
        settings.paths_originalNaming = radio_pathsNameOriginal.value;
        settings.paths_customName = edit_pathsNameCustom.text;
        settings.paths_existing = drop_pathsExist.selection.index;
        settings.paths_suffix = edit_pathsSuffix.text;
    
        // settings.channels = chk_channels.value;
        settings.channels = drop_channelsRuling.selection.index;
        settings.channels_match = edit_channelsMatch.text;
        settings.channels_originalNaming = radio_channelsNameOriginal.value;
        settings.channels_customName = edit_channelsNameCustom.text;
        settings.channels_existing = drop_channelsExist.selection.index;
        settings.channels_suffix = edit_channelsSuffix.text;
    
        // settings.rasters = chk_rasters.value;
        settings.rasters = drop_rastersRuling.selection.index;
        settings.rasters_match = edit_rastersMatch.text;
        settings.rasters_originalNaming = radio_rastersNameOriginal.value;
        settings.rasters_customName = edit_rastersNameCustom.text;
        settings.rasters_existing = drop_rastersExist.selection.index;
        settings.rasters_suffix = edit_rastersSuffix.text;

        var desc = new ActionDescriptor();
            desc.putInteger(0, settings.paths);
            desc.putString(1, settings.paths_match);
            desc.putBoolean(2, settings.paths_originalNaming);
            desc.putString(3, settings.paths_customName);
            desc.putInteger(4, settings.paths_existing);
            desc.putString(5, settings.paths_suffix);
            desc.putInteger(6, settings.channels);
            desc.putString(7, settings.channels_match);
            desc.putBoolean(8, settings.channels_originalNaming);
            desc.putString(9, settings.channels_customName);
            desc.putInteger(10, settings.channels_existing);
            desc.putString(11, settings.channels_suffix);
            desc.putInteger(12, settings.rasters);
            desc.putString(13, settings.rasters_match);
            desc.putBoolean(14, settings.rasters_originalNaming);
            desc.putString(15, settings.rasters_customName);
            desc.putInteger(16, settings.rasters_existing);
            desc.putString(17, settings.rasters_suffix);
            desc.putString(18, settings.pathSource);
            desc.putString(19, settings.pathDestination);
        app.putCustomOptions("berglund", desc);
    
        return true;
    
    }

    } catch(e) {
        alert(e)
    }
}

function init() {
    
    // Show window
    var ok = createDialog();
    if (ok === 2) return false;

    // Keeping the ruler settings to reset in the end of the script
    var startRulerUnits = app.preferences.rulerUnits;
    var startTypeUnits = app.preferences.typeUnits;
    var startDisplayDialogs = app.displayDialogs;
    
    // Changing ruler settings to pixels for correct image resizing
    app.preferences.rulerUnits = Units.PIXELS;
    app.preferences.typeUnits = TypeUnits.PIXELS;
    app.displayDialogs = DialogModes.NO;

    // Timer prep
    var d = new Date();
    timeStart = d.getTime() / 1000;

    //// MAIN FUNCTION RUN ////
    try {
        activeDocument.suspendHistory("Berglund", "main()");
    } catch(e) {
        main();
    }
    ///////////////////////////

    // Timer calculate
    var timeFull = timeSinceStart(timeStart);
    alert("Time elapsed " + formatSeconds(timeFull) + "\n" + (filesListSource.length * 2) + " files processed");
    
    if (errorList.length > 1) {
        alert(errorList.join("\n"));
    }

    // Reset the ruler
    app.preferences.rulerUnits = startRulerUnits;
    app.preferences.typeUnits = startTypeUnits;
    app.displayDialogs = startDisplayDialogs;

}

function main() {

    function SnpCreateDialog() {
        this.windowRef = null;
    }
    var w_palette;
    SnpCreateDialog.prototype.run = function() {
        w_palette = new Window("palette");
        w_palette.alignChildren = "right";
        this.windowRef = w_palette;
        w_palette.ptxt = w_palette.add("statictext", [0,0,320,20], "Transferring all the things...");
        w_palette.pbar = w_palette.add("progressbar", [0,0,320,20], 0, (filesListSource.length + 1));
        w_palette.show();
        return true;
    }
    if (typeof(SnpCreateDialog_unitTest) == "undefined") {
        new SnpCreateDialog().run();
        app.refresh();
    }

    w_palette.pbar.value = 1;

    for (i = 0; i < filesListSource.length; i++) {
        try {

            var errorsFound = [];
            
            var itemSource = filesListSource[i];
            var itemDest = filesListDestination[i];

            if (String(itemSource) == String(itemDest)) throw 1;

            app.open(itemDest);
            var docDest = activeDocument;
            app.open(itemSource);
            var docSource = activeDocument;

            if (docDest.resolution != docSource.resolution) throw 2;  
            if ((docDest.width != docSource.width) || (docDest.length != docSource.length)) throw 2;

            app.refresh();

            //// ---------------- ////
            //// -- LESSS GOOO -- ////
            //// ---------------- ////

            // Paths
            if (settings.paths != 2) { // If not Transfer none
                var itemToMove, removedAll, skipItem, keeping;
                itemName = undefined;
                var sourcePaths = docSource.pathItems;
                var destPaths = docDest.pathItems;
                if (sourcePaths.length != 0) {
                    for (j = 0; j < sourcePaths.length; j++) {
                        
                        itemToMove = sourcePaths[j];

                        if (settings.paths == 1) { // Transfer only name match
                            if (itemToMove.name != settings.paths_match) continue;
                        }

                        if (!settings.paths_originalNaming && settings.paths_customName != "" && settings.paths_customName != " ") { // If custom name
                            itemName = settings.paths_customName;
                            itemToMove.name = itemName;
                        } else {
                            itemName = itemToMove.name;
                        }

                        if (settings.paths_existing != 4) { // Ignores if items with the same name is allowed
                            app.activeDocument = docDest;
                            for (k = 0; k < destPaths.length; k++) {
                                if (destPaths[k].name == itemName) {
                                    switch (settings.paths_existing) {
                                        case 0:
                                            itemName = itemName + settings.paths_suffix;
                                            app.activeDocument = docSource;
                                            itemToMove.name = itemName;
                                            app.activeDocument = docDest;
                                            break;
                                        case 1:
                                            destPaths[k].remove();
                                            break;
                                        case 2:
                                            if (!removedAll) destPaths.removeAll();
                                            removedAll = true;
                                            break;
                                        case 3:
                                            var dia = dialogCollide("path", itemName, settings.paths_suffix);
                                            switch (dia) {
                                                case "suffix":
                                                    app.activeDocument = docSource;
                                                    itemToMove.name = itemName;
                                                    app.activeDocument = docDest;
                                                    break;
                                                case "replace":
                                                    destPaths[k].remove();
                                                    break;
                                                case "keep":
                                                    keeping = true;
                                                    break;
                                                case "skip":
                                                    skipItem = true;
                                                    break;
                                                default:
                                                    skipItem = true;
                                                    pushError(0, [itemSource, itemDest]);
                                            }
                                            break;
                                        case 5:
                                            skipItem = true;
                                            break;
                                    }
                                    break;
                                }
                            }
                            app.activeDocument = docSource;
                        }
                        if (skipItem) continue;

                        // Safety deselect to avoid pasting the path into another
                        if (destPaths.length != 0) {
                            app.activeDocument = docDest;
                            destPaths[0].select();
                            destPaths[0].deselect();
                            app.activeDocument = docSource;
                        }

                        // Select Path Selection Tool
                        var idselect = stringIDToTypeID( "select" );
                            var desc203 = new ActionDescriptor();
                            var idnull = stringIDToTypeID( "null" );
                                var ref124 = new ActionReference();
                                var idpathComponentSelectTool = stringIDToTypeID( "pathComponentSelectTool" );
                                ref124.putClass( idpathComponentSelectTool );
                            desc203.putReference( idnull, ref124 );
                            var iddontRecord = stringIDToTypeID( "dontRecord" );
                            desc203.putBoolean( iddontRecord, true );
                            var idforceNotify = stringIDToTypeID( "forceNotify" );
                            desc203.putBoolean( idforceNotify, true );
                        executeAction( idselect, desc203, DialogModes.NO );

                        // Select the path
                        var idselect = stringIDToTypeID( "select" );
                            var desc172 = new ActionDescriptor();
                            var idnull = stringIDToTypeID( "null" );
                            var ref95 = new ActionReference();
                            var idpath = stringIDToTypeID( "path" );
                            ref95.putName( idpath, itemName );
                            desc172.putReference( idnull, ref95 );
                            executeAction( idselect, desc172, DialogModes.NO );

                        // Copy the path
                        var idcopy = charIDToTypeID( "copy" );
                        executeAction( idcopy, undefined, DialogModes.NO );

                        app.activeDocument = docDest;

                        // Paste the path
                        var idpaste = stringIDToTypeID( "paste" );
                        executeAction( idpaste, undefined, DialogModes.NO );

                        // Select Move Tool
                        var idselect = stringIDToTypeID( "select" );
                            var desc199 = new ActionDescriptor();
                            var idnull = stringIDToTypeID( "null" );
                                var ref120 = new ActionReference();
                                var idmoveTool = stringIDToTypeID( "moveTool" );
                                ref120.putClass( idmoveTool );
                            desc199.putReference( idnull, ref120 );
                            var iddontRecord = stringIDToTypeID( "dontRecord" );
                            desc199.putBoolean( iddontRecord, true );
                            var idforceNotify = stringIDToTypeID( "forceNotify" );
                            desc199.putBoolean( idforceNotify, true );
                        executeAction( idselect, desc199, DialogModes.NO );

                        if (settings.paths_existing == 4 || keeping) {
                            activeDocument.pathItems[activeDocument.pathItems.length - 1].select();
                            // Convert kind.WORKPATH to kind.NORMALPATH
                            var idmake = stringIDToTypeID( "make" );
                                var desc49 = new ActionDescriptor();
                                var idnull = stringIDToTypeID( "null" );
                                    var ref35 = new ActionReference();
                                    var idpath = stringIDToTypeID( "path" );
                                    ref35.putClass( idpath );
                                desc49.putReference( idnull, ref35 );
                                var idfrom = stringIDToTypeID( "from" );
                                    var ref36 = new ActionReference();
                                    var idpath = stringIDToTypeID( "path" );
                                    var idworkPath = stringIDToTypeID( "workPath" );
                                    ref36.putProperty( idpath, idworkPath );
                                desc49.putReference( idfrom, ref36 );
                                var idname = stringIDToTypeID( "name" );
                                desc49.putString( idname, itemName );
                            executeAction( idmake, desc49, DialogModes.NO );
                            activeDocument.pathItems[activeDocument.pathItems.length - 1].deselect();
                        }
                        app.activeDocument = docSource;

                    }
                } else {
                    // errorsFound.push("No paths found in source file");
                }

            }

            // Channels
            if (settings.channels != 2) {

                var itemToMove, removedAll, skipItem, keeping;
                itemName = undefined;
                var sourceChannels = docSource.channels;
                var destChannels = docDest.channels;

                switch (docSource.mode) {
                    case DocumentMode.RGB:
                        var chIndex = 3;
                        break;
                    case DocumentMode.CMYK:
                        var chIndex = 4;
                        break;
                    case DocumentMode.INDEXEDCOLOR:
                        var chIndex = 1;
                        break;
                    case DocumentMode.GRAYSCALE:
                        var chIndex = 1;
                        break;
                    case DocumentMode.MULTICHANNEL:
                        var chIndex = 0;
                        try { sourceChannels.getByName("Cyan"); chIndex++; } catch(e) {};
                        try { sourceChannels.getByName("Magenta"); chIndex++; } catch(e) {};
                        try { sourceChannels.getByName("Yellow"); chIndex++; } catch(e) {};
                        try { sourceChannels.getByName("Black"); chIndex++; } catch(e) {};
                        break;
                    default: throw 3;
                }

                if (sourceChannels.length > chIndex) {
                    for (j = chIndex; j < sourceChannels.length; j++) {
                        
                        itemToMove = sourceChannels[j];

                        if (settings.channels == 1) { // Transfer only name match
                            if (itemToMove.name != settings.channels_match) continue;
                        }

                        if (!settings.channels_originalNaming && settings.channels_customName != "" && settings.channels_customName != " ") { // If custom name
                            itemName = settings.channels_customName;
                            itemToMove.name = itemName;
                        } else {
                            itemName = itemToMove.name;
                        }

                        if (settings.channels_existing != 4) { // Ignores if items with the same name is allowed
                            app.activeDocument = docDest;
                            for (k = 0; k < destChannels.length; k++) {
                                if (destChannels[k].name == itemName) {
                                    switch (settings.channels_existing) {
                                        case 0:
                                            itemName = itemName + settings.channels_suffix;
                                            app.activeDocument = docSource;
                                            itemToMove.name = itemName;
                                            app.activeDocument = docDest;
                                            break;
                                        case 1:
                                            destChannels[k].remove();
                                            break;
                                        case 2:
                                            if (!removedAll) destChannels.removeAll();
                                            removedAll = true;
                                            break;
                                        case 3:
                                            var dia = dialogCollide("channel", itemName, settings.channels_suffix);
                                            switch (dia) {
                                                case "suffix":
                                                    app.activeDocument = docSource;
                                                    itemToMove.name = itemName;
                                                    app.activeDocument = docDest;
                                                    break;
                                                case "replace":
                                                    destChannels[k].remove();
                                                    break;
                                                case "keep":
                                                    break;
                                                case "skip":
                                                    skipItem = true;
                                                    break;
                                                default:
                                                    skipItem = true;
                                                    pushError(0, [itemSource, itemDest]);
                                            }
                                            break;
                                        case 5:
                                            skipItem = true;
                                            break;
                                    }
                                    break;
                                }
                            }
                            app.activeDocument = docSource;
                        }
                        if (skipItem) continue;

                        var movedItem = itemToMove.duplicate(docDest);

                        app.activeDocument = docDest;
                        docDest.activeChannels = [destChannels[0],destChannels[1],destChannels[2]];
                        
                        movedItem.name = itemName;
                        app.activeDocument = docSource;

                    }
                } else {
                    // errorsFound.push("No channels found in source file");
                }
                
            }

            // Raster layers
            if (settings.rasters != 2) {

                var itemToMove, removedAll, skipItem, keeping;
                itemName = undefined;
                matchingLayer = undefined;
                var sourceRasters = docSource.layers;
                var destRasters = docDest.layers;
                
                for (j = 0; j < sourceRasters.length; j++) {
                    
                    itemToMove = sourceRasters[j];

                    if (itemToMove == docSource.backgroundLayer) continue;
                    if (itemToMove.typename === "LayerSet") {
                        exploreLayer(itemToMove);
                        itemToMove = matchingLayer;
                        matchingLayer = undefined;
                    }

                    if (settings.rasters == 1) { // Transfer only name match
                        if (itemToMove.name != settings.rasters_match) continue;
                    }

                    if (!settings.rasters_originalNaming && settings.rasters_customName != "" && settings.rasters_customName != " ") { // If custom name
                        itemName = settings.rasters_customName;
                        itemToMove.name = itemName;
                    } else {
                        itemName = itemToMove.name;
                    }

                    if (settings.rasters_existing != 3) { // Ignores if items with the same name is allowed
                        app.activeDocument = docDest;

                        for (k = 0; k < destRasters.length; k++) {
                            var newLayer;
                            exploreLayer(destRasters[k], itemName);
                            if (matchingLayer != undefined) {

                                docDest.activeLayer = matchingLayer;
                                
                                // Create layer above current layer
                                var idmake = stringIDToTypeID( "make" );
                                    var desc272 = new ActionDescriptor();
                                    var idnull = stringIDToTypeID( "null" );
                                        var ref225 = new ActionReference();
                                        var idlayer = stringIDToTypeID( "layer" );
                                        ref225.putClass( idlayer );
                                    desc272.putReference( idnull, ref225 );
                                    var idlayerID = stringIDToTypeID( "layerID" );
                                    desc272.putInteger( idlayerID, 20 );
                                executeAction( idmake, desc272, DialogModes.NO );

                                newLayer = docDest.activeLayer;

                                switch (settings.rasters_existing) {
                                    case 0:
                                        itemName = itemName + settings.rasters_suffix;
                                        app.activeDocument = docSource;
                                        itemToMove.name = itemName;
                                        app.activeDocument = docDest;
                                        break;
                                    case 1:
                                        matchingLayer.remove();
                                        break;
                                    case 2:
                                        var dia = dialogCollide("raster layer", itemName, settings.rasters_suffix);
                                        switch (dia) {
                                            case "suffix":
                                                app.activeDocument = docSource;
                                                itemToMove.name = itemName;
                                                app.activeDocument = docDest;
                                                break;
                                            case "replace":
                                                matchingLayer.remove();
                                                break;
                                            case "keep":
                                                break;
                                            case "skip":
                                                skipItem = true;
                                                break;
                                            default:
                                                skipItem = true;
                                                pushError(0, [itemSource, itemDest]);
                                        }
                                        break;
                                    case 4:
                                        skipItem = true;
                                        break;
                                }
                                break;
                            }
                        }
                        app.activeDocument = docSource;
                    }
                    if (skipItem) {
                        newLayer.remove();
                        continue;
                    }
                    
                    app.activeDocument = docSource;
                    activeDocument.activeLayer = itemToMove;
                    var istEineMask = hasLayerMask();
                    itemToMove.copy();
                    app.activeDocument = docDest;
                    newLayer = docDest.artLayers.add();
                    pasteInPlace();
                    newLayer.name = itemName;

                    if (istEineMask) {
                        app.activeDocument = docSource;
                        activeDocument.activeLayer = itemToMove;

                        enterMask();
                        activeDocument.selection.selectAll();
                        activeDocument.selection.copy();
                        activeDocument.selection.deselect();
                        exitMask();

                        app.activeDocument = docDest;
                        activeDocument.activeLayer = newLayer;
                        if (enterMask() == null) {
                            createMask();
                            enterMask();
                        }
                        activeDocument.paste();
                        activeDocument.selection.deselect();
                        exitMask();
                    }

                    removeColor();

                }

            }

            //// ----------- ////
            //// -- OKBYE -- ////
            //// ----------- ////

            w_palette.pbar.value++;

            docSource.close(SaveOptions.DONOTSAVECHANGES);
            docDest.close(SaveOptions.SAVECHANGES);

            if (errorsFound.length != 0) {
                pushError(errorsFound, [itemSource, itemDest]);
            }

        } catch(e) {
            pushError(e.line + ": " + e, [itemSource, itemDest]);

            try {
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);
                activeDocument.close(SaveOptions.DONOTSAVECHANGES);
            } catch(e) {
                // Prob just not open
            }
        }
    }

    w_palette.close();

}

// FUNCTIONS

function timeSinceStart(start) {
    if (start == null) return null;
    var d = new Date();
    var timeNow = d.getTime() / 1000;
    return timeNow - start;
}

function formatSeconds(sec) {
    String.prototype.repeat = function(x) {
        var str = "";
        for (var repeats = 0; repeats < x; repeats++) str = str + this;
        return str;
    };
    Number.prototype.twoDigits = function() {
        if (this == 0) return ('0'.repeat(2));
        var dec = this / (Math.pow(10, 2));
        if (String(dec).substring(String(dec).lastIndexOf(".") + 1, String(dec).length).length == 1) dec = dec + "0";
        var str = dec.toString().substring(2, dec.toString().length);
        return str;
    };
    var hours = Math.floor(sec / 60 / 60);
    var minutes = Math.floor(sec / 60) - (hours * 60);
    var seconds = sec % 60;
    return Math.floor(hours).twoDigits() + ':' + Math.floor(minutes).twoDigits() + ':' + Math.floor(seconds).twoDigits();
}

function selectFiles(folder, promptText) {
    if (File.fs == "Windows") {
        var fileMask = "*.psd, *.psb, *.tif, *.tiff, *.jpg, *.jpeg, *.jpf, *.png, *.targa";
    } else {
        var matchExpression = /(\.psd$)|(\.psb$)|(\.tif$)|(\.tiff$)|(\.jpg$)|(\.jpeg$)|(\.jpf$)|(\.png$)|(\.targa$)/i;
        var fileMask = function(file) { return file instanceof Folder || (!(file.hidden) && (file.name.match(matchExpression))); };
    }

    var refFiles = File(folder).openDlg(promptText, fileMask, true);
    if (refFiles != null) return refFiles;
}
                
function isEqual(a, b) {
    if (a.length != b.length)
        return false;
        else
        {
        for (var i = 0; i < a.length; i++)
        if(a[i] != b[i])
            return false;
            return true;
        }
}

function removeColor() {
    var idset = stringIDToTypeID( "set" );
        var desc209 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
            var ref155 = new ActionReference();
            var idlayer = stringIDToTypeID( "layer" );
            var idordinal = stringIDToTypeID( "ordinal" );
            var idtargetEnum = stringIDToTypeID( "targetEnum" );
            ref155.putEnumerated( idlayer, idordinal, idtargetEnum );
        desc209.putReference( idnull, ref155 );
        var idto = stringIDToTypeID( "to" );
            var desc210 = new ActionDescriptor();
            var idcolor = stringIDToTypeID( "color" );
            var idcolor = stringIDToTypeID( "color" );
            var idnone = stringIDToTypeID( "none" );
            desc210.putEnumerated( idcolor, idcolor, idnone );
        var idlayer = stringIDToTypeID( "layer" );
        desc209.putObject( idto, idlayer, desc210 );
    executeAction( idset, desc209, DialogModes.NO );
}

function hasLayerMask() {
	try {
		var ref = new ActionReference();
		var keyUserMaskEnabled = app.charIDToTypeID( 'UsrM' );
		ref.putProperty( app.charIDToTypeID( 'Prpr' ), keyUserMaskEnabled );
		ref.putEnumerated( app.charIDToTypeID( 'Lyr ' ), app.charIDToTypeID( 'Ordn' ), app.charIDToTypeID( 'Trgt' ) );
		var desc = executeActionGet( ref );
		if ( desc.hasKey( keyUserMaskEnabled ) ) {
			return true;
		} else {
			return false;
		}
	} catch(e) {
		return false;
	}
}

function createMask() {
    var idmake = stringIDToTypeID( "make" );
        var desc112 = new ActionDescriptor();
        var idnew = stringIDToTypeID( "new" );
        var idchannel = stringIDToTypeID( "channel" );
        desc112.putClass( idnew, idchannel );
        var idat = stringIDToTypeID( "at" );
            var ref85 = new ActionReference();
            var idchannel = stringIDToTypeID( "channel" );
            var idchannel = stringIDToTypeID( "channel" );
            var idmask = stringIDToTypeID( "mask" );
            ref85.putEnumerated( idchannel, idchannel, idmask );
        desc112.putReference( idat, ref85 );
        var idusing = stringIDToTypeID( "using" );
        var iduserMaskEnabled = stringIDToTypeID( "userMaskEnabled" );
        var idrevealAll = stringIDToTypeID( "revealAll" );
        desc112.putEnumerated( idusing, iduserMaskEnabled, idrevealAll );
    executeAction( idmake, desc112, DialogModes.NO );
}

function enterMask() {
    try {
        var idselect = stringIDToTypeID( "select" );
        var desc68 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
             var ref49 = new ActionReference();
             var idchannel = stringIDToTypeID( "channel" );
             var idchannel = stringIDToTypeID( "channel" );
             var idmask = stringIDToTypeID( "mask" );
             ref49.putEnumerated( idchannel, idchannel, idmask );
        desc68.putReference( idnull, ref49 );
        var idmakeVisible = stringIDToTypeID( "makeVisible" );
        desc68.putBoolean( idmakeVisible, true );
        executeAction( idselect, desc68, DialogModes.NO );
        return true;
    } catch(e) { // No mask
        return null;
    }
}

function exitMask() {
    try {
        var idselect = stringIDToTypeID( "select" );
        var desc71 = new ActionDescriptor();
        var idnull = stringIDToTypeID( "null" );
             var ref52 = new ActionReference();
             var idchannel = stringIDToTypeID( "channel" );
             var idchannel = stringIDToTypeID( "channel" );
             var idRGB = stringIDToTypeID( "RGB" );
             ref52.putEnumerated( idchannel, idchannel, idRGB );
        desc71.putReference( idnull, ref52 );
        var idmakeVisible = stringIDToTypeID( "makeVisible" );
        desc71.putBoolean( idmakeVisible, false );
        executeAction( idselect, desc71, DialogModes.NO );
        return true;
    } catch(e) { // No mask
        return null;
    }
}

function pasteInPlace() {
    var idpaste = stringIDToTypeID( "paste" );
        var desc342 = new ActionDescriptor();
        var idinPlace = stringIDToTypeID( "inPlace" );
        desc342.putBoolean( idinPlace, true );
        var idantiAlias = stringIDToTypeID( "antiAlias" );
        var idantiAliasType = stringIDToTypeID( "antiAliasType" );
        var idantiAliasNone = stringIDToTypeID( "antiAliasNone" );
        desc342.putEnumerated( idantiAlias, idantiAliasType, idantiAliasNone );
        var idas = stringIDToTypeID( "as" );
        var idpixel = stringIDToTypeID( "pixel" );
        desc342.putClass( idas, idpixel );
    executeAction( idpaste, desc342, DialogModes.NO );
    return activeDocument.activeLayer;
}

function pushError(code, files) {
    var str = "";
    switch(code) {
        case 0: str = "Unknown error (skipped file): " + files[0]; break;
        case 1: str = "Source file same as destination file: " + files[0]; break;
        case 2: str = "Resolution or size mismatch: " + files[0]; break;
        case 3: str = "Unsupported document mode (" + activeDocument.mode + "): " + files[0]; break;
        default: str = "Error: " + files[0] + "\n" + code;
    }
    errorList.push(str);
}

function exploreLayer(layerInput, name) {

    if (layerInput.typename === "LayerSet"){
        if (layerInput.layers.length > 0){
            for (var i = layerInput.layers.length-1; i > -1; i--) exploreLayer(layerInput.layers[i], name);
        }
    } else if (layerInput.parent == activeDocument) {
        if (layerInput.name == name) matchingLayer = layerInput;
    } else {
        if (name == undefined) matchingLayer = layerInput;
        if (layerInput.name == name) matchingLayer = layerInput;
    }

    if (matchingLayer != undefined) return;
}

function dialogCollide(type, sourceName, suffix) {

    var wDialog = new Window('dialog', "Colliding items");
        wDialog.alignChildren = "left";
        wDialog.orientation = "column";

    wDialog.add("statictext",[0,0,420,60],"A " + type + " with the same name (\"" + sourceName + "\") already exist in the destination document.\nWhat would you like to do?",{ multiline:true });

    var grp_Dialog_Btn = wDialog.add("group");
        grp_Dialog_Btn.orientation = "row";
        grp_Dialog_Btn.alignment = "left";
        
        var btn_Dialog_Opt1 = grp_Dialog_Btn.add ("button",[0,0,100,20], "Add suffix");
        var btn_Dialog_Opt2 = grp_Dialog_Btn.add ("button",[0,0,100,20], "Replace");
        var btn_Dialog_Opt3 = grp_Dialog_Btn.add ("button",[0,0,100,20], "Keep both");
        var btn_Dialog_Opt4 = grp_Dialog_Btn.add ("button",[0,0,100,20], "Skip");

        btn_Dialog_Opt1.onClick = function() {

            var wDialogSuffix = new Window('dialog', "Suffix");
                wDialogSuffix.alignChildren = "left";
                wDialogSuffix.orientation = "column";
    
            var grp_DialogSuffix_Text = wDialogSuffix.add("group");
                grp_DialogSuffix_Text.orientation = "row";
                grp_DialogSuffix_Text.alignment = "left";
    
                var dialogSuffixEdit = grp_DialogSuffix_Text.add("edittext",[0,0,100,20],suffix);
                var dialogSuffixText = grp_DialogSuffix_Text.add("statictext",[0,0,160,20],sourceName + suffix);
                dialogSuffixEdit.onChanging = function() {
                    dialogSuffixText.text = sourceName + dialogSuffixEdit.text;
                }
    
            var grp_DialogSuffix_Btn = wDialogSuffix.add("group");
                grp_DialogSuffix_Btn.orientation = "row";
                grp_DialogSuffix_Btn.alignment = "right";
                
                var btn_DialogSuffix_Cancel = grp_DialogSuffix_Btn.add ("button",[0,0,80,20], "Cancel");
                var btn_DialogSuffix_Ok = grp_DialogSuffix_Btn.add ("button",[0,0,80,20], "OK");
    
                btn_DialogSuffix_Ok.onClick = function() {
                    itemName = dialogSuffixText.text;
                    wDialogSuffix.close();
                }
                btn_DialogSuffix_Cancel.onClick = function() {
                    wDialogSuffix.close();
                    wDialog.show();
                }
    
            wDialogSuffix.center();
            wDialogSuffix.show();
            
            x = "suffix";
            wDialog.close();

        }
        btn_Dialog_Opt2.onClick = function() {
            x = "replace";
            wDialog.close();
        }
        btn_Dialog_Opt3.onClick = function() {
            x = "keep";
            wDialog.close();
        }
        btn_Dialog_Opt4.onClick = function() {
            x = "skip";
            wDialog.close();
        }

    wDialog.center();
    wDialog.show();

    return x;

}