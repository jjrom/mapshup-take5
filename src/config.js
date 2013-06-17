(function(c) {

    /*
     * Update configuration options
     * 
     * Should be changed to match target server
     */
    c["general"].rootUrl = "http://localhost/mapshupTake5";
    c["general"].serverRootUrl = c["general"].rootUrl + "/s";


    /*
     * !! DO NOT EDIT UNDER THIS LINE !!
     */
    c["general"].themePath = "/js/mapshup/theme/default";
    c["general"].displayContextualMenu = false;
    c["general"].displayCoordinates = false;
    c["general"].displayScale = false;
    c["general"].timeLine = {
        enable: false
    };
    c["general"].overviewMap = "closed";
    c.remove("layers", "Streets");
    c.remove("layers", "Satellite");
    c.remove("layers", "Relief");
    c.remove("layers", "MapQuest OSM");
    c.remove("layers", "OpenStreetMap");
    c.add("layers", {
        type: "Bing",
        title: "Satellite",
        key: "AmraZAAcRFVn6Vbxk_TVhhVZNt66x4_4SV_EvlfzvRC9qZ_2y6k1aNsuuoYS0UYy",
        bingType: "Aerial"
    });
    c.extend("Navigation", {
        position: 'nw',
        orientation: 'h',
        home: null
    });
    c.extend("Help", {
        noLogo: true,
        rootUrl: c["general"].rootUrl + 'take5'
    });
    c.add("plugins",
            {
                name: "Take5",
                options: {
                    /*searchService: "http://localhost/ptsc/take5/www/ws/search.php?q=",
                    sitesUrl: "http://localhost/ptsc/take5/www/ws/getSites.php?language="*/
                    searchService: "http://spirit.cnes.fr/take5/ws/search.php?q=",
                    sitesUrl: "http://spirit.cnes.fr/take5/ws/getSites.php?language="
                }
            }
    );

})(window.M.Config);