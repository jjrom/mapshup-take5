/**
 * Plugin for the "Take5" project
 * See http://take5.ptsc.fr
 * 
 * @author : Jerome Gasperi @ CNES
 * @date   : 2013.04.19
 *  
 * @param {MapshupObject} M
 */
(function(M) {

    M.Plugins.Take5 = function() {

        /*
         * Only one Take5 object instance is created
         */
        if (M.Plugins.Take5._o) {
            return M.Plugins.Take5._o;
        }

        /*
         * Set to true when plugin is initialized
         */
        this.initialized = false;

        /*
         * Sites layer
         */
        this.layer = null;

        /*
         * Site features
         */
        this.features = [];
        
        /*
         * Layers
         */
        this.layers = [];
        
        /**
         * Selected Feature
         */
        this.selectedFeature = null;
        
        /**
         * Selected Site
         */
        this.selectedSite = null;

        /**
         * Init plugin
         * 
         * @param {Object} options
         */
        this.init = function(options) {

            var options, self = this;

            /*
             * Init options
             */
            options = options || {};

            $.extend(self, {
                searchService: options.searchService,
                archivesUrl: options.archivesUrl,
                downloadUrl: options.downloadUrl,
                licenseUrl: options.licenseUrl,
                addUserDownloadUrl: options.addUserDownloadUrl,
                aboutUrl: options.aboutUrl
            });

            /*
             * Set mapshup logo
             */
            M.$map.append('<div style="position:absolute;bottom:10px;right:30px;z-index:999;"><a href="http://mapshup.info" title="Powered with mapshup" target="_blank"><img src="./img/mapshuplogo.png"/></a></div>');

            /*
             * Set Help and links
             */
            M.Util.$$('#Mheader').append('<div class="links"><ul><li><a href="' + self.aboutUrl + '" target="_blank">' + self._("About") + '</a></li></ul></div>');

            /*
             * Tell user that Take5 initializes
             */
            M.mask.add({
                title: self._("Initializing Take5"),
                cancel: false
            });

            /*
             * Asynchronously retrieve sites description from GeoJSON layer
             */
            self.layer = M.Map.addLayer({
                type: "GeoJSON",
                url: options.sitesUrl + M.Config.i18n.lang,
                title: "Take5 Sites",
                hidden: false,
                clusterized: false,
                color: '#FFFF00',
                opacity: 0,
                unremovable: true,
                featureInfo: {
                    noMenu: true,
                    onSelect: function(f) {
                        if (self.$s) {
                            $('option[value=' + f.attributes.identifier + ']', self.$s).prop('selected', 'selected');
                            self.$s.change();
                        }

                    }
                },
                ol: {
                    displayInLayerSwitcher: false,
                    styleMap: new OpenLayers.StyleMap({
                        "default": new OpenLayers.Style(OpenLayers.Util.applyDefaults({
                        fillOpacity: 0.01,
                        strokeColor:"#F00",
                        strokeWidth:1,
                        fillColor:"#000"
                        },
                        OpenLayers.Feature.Vector.style["default"]),
                        {}),
                        "select": {
                            strokeColor:"#ffff00",
                            fillOpacity: 0.01
                        }
                    })
                }
            });

            /*
             * Set MMI after GeoJSON sites layer had been loaded
             */
            M.Map.events.register("layersend", self, function(action, layer, scope) {

                if (!self.initialized && layer.id === self.layer.id && action === "features") {

                    var id = M.Util.getId(), i, l;

                    /*
                     * Display sites within select form
                     * 
                     * +---------------------------------------------------+
                     * |                                                   |
                     * |  +-------------------container------------------+ |
                     * |  |+------------+ +----------rightCol-----------+| |
                     * |  ||            | |                             || |
                     * |  ||  leftCol   | |   lastql      quickselector || |
                     * |  ||            | |                             || |
                     * |  ||            | |                  download   || |
                     * |  |+------------+ +-----------------------------+| |
                     * |  +----------------------------------------------+ |
                     * |                     copyright                     |
                     * +---------------------------------------------------+
                     * 
                     */
                    $('#Mfooter').html('<div class="container"><div id="leftCol"><form><p class="title">' + self._("Choose a site") + '</p><select id="' + id + '"></select></form><p class="description"></p></div><div id="rightCol"><div id="side1"></div><div id="side2"></div></div></div>');
                    self.$s = $('#' + id);
                    self.$s.append('<option name="---" value="---">---</option>');
                    for (i = 0, l = layer.features.length; i < l; i++) {
                        (function($s, site) {
                            $s.append('<option name="' + site.attributes.identifier + '" value="' + site.attributes.identifier + '">' + site.attributes.title + '</option>');
                        })(self.$s, layer.features[i]);
                    }

                    /*
                     * Select first class by default
                     */
                    $('option:first-child', self.$s).attr("selected", "selected");

                    /*
                     * SelectBoxIt
                     */
                    self.$s.selectBoxIt({
                        aggressiveChange: true
                    });

                    self.$s.change(function() {

                        /*
                         * Get site (i.e. an OpenLayers.Feature)
                         */
                        var site = self.getSite($(':selected', $(this)).attr("name"));
                        if (site) {

                            /*
                             * Select feature on map if not already selected
                             */
                            if (!M.Map.featureInfo.selected || (M.Map.featureInfo.selected && M.Map.featureInfo.selected.id !== site.id)) {
                                M.Map.featureInfo.select(site, true);
                            }
                            else {
                                M.Map.map.zoomToExtent(site.geometry.getBounds());
                                self.showSite(site);
                            }
                        }
                        else {
                            M.Map.setCenter(M.Map.Util.d2p(new OpenLayers.LonLat(0, 40)), 2, true);
                            M.Map.featureInfo.clear();
                            self.clear();
                        }

                    });

                    /*
                     * Copyright
                     */
                    $('#Mfooter').append('<div class="copyright">' + self._("Take 5 project") + ' | <a href="http://www.cnes.fr">CNES</a> - <a href="http://www.cesbio.ups-tlse.fr">Cesbio</a> | ' + self._("All right reserved") + ' - copyright <a href="http://www.cnes.fr">CNES</a> © ' + (new Date()).getFullYear() + '</div>');

                    /*
                     * Avoid multiple initialization
                     */
                    self.initialized = true;
                    M.mask.hide();

                }

            });

            /*
             * Main quicklook size should be recalculated when widow is resized
             */
            M.Map.events.register("resizeend", self, function(scope) {
                scope.resize();
            });

            return self;

        };

        this.resize = function() {

            /*
             * Avoid quicklook to be outside its container
             */
            $('#lastql').css({
                'max-height': $('#Mfooter').height() - 120,
                'max-width': $('#side1').width() - 20
            });

        };


        /*
         * Get site from identifier
         * 
         * @param {String} identifier
         * @return {OpenLayers.Feature}
         */
        this.getSite = function(identifier) {
            if (identifier && this.layer && this.layer.features) {
                for (var i = 0, l = this.layer.features.length; i < l; i++) {
                    if (this.layer.features[i].attributes.identifier === identifier) {
                        return this.layer.features[i];
                    }
                }
            }
            return null;
        };

	this.displayPopupDownload = function(file, title) {
		var content = '<form id="downloadProduct">';
                content += '<label>'+M.Plugins.Take5._o._("Last name")+'</label>';
                content += '<input type="text" id="lastName" style="margin-bottom:10px;" required>';
                content += '</br>';
                content += '<label>'+M.Plugins.Take5._o._("First name")+'</label>';
                content += '<input type="text" id="firstName" style="margin-bottom:10px;" required>';
                content += '</br>';
                content += '<label>'+M.Plugins.Take5._o._("Email")+'</label>';
                content += '<input type="email" id="email" style="margin-bottom:10px;" required>';
                content += '</br>';
                content += '<textarea style="width:560px;height:100px;margin-bottom:10px;" disabled>';
                content += '</textarea>';
                content += '</br>';
                content += '<label style="width:400px;">'+M.Plugins.Take5._o._("I have read the license to use and I agree to abide by the terms")+'</label>';
                content += '<input type="checkbox" id="accept">';
                content += '</form>';
                var popup;
                var options = {
                    title: title,
                    content: content,
                    dataType: "list",
                    resize: false,
                    value: [{
                        title:M.Util._("Ok"), 
                        value:"y"
                    },
                    {
                        title:M.Util._("Cancel"), 
                        value:"n"
                    }],
                    callback: function(v){
                        if (v === 'y') {
                            if($("#lastName").val().length === 0 || $("#firstName").val().length === 0 
                                    || $("#email").val().length === 0
                                || !$("#accept")[0].checked) {
                                alert(M.Plugins.Take5._o._("You have to fill all the fields and accept the license"));
                            } else {
                                //window.open(M.Plugins.Take5._o.downloadUrl+"?file="+file, "_blank");
                                window.open(file, "_blank");
                                
                                $.post(M.Plugins.Take5._o.addUserDownloadUrl, {
                                    lastname: $("#lastName").val(),
                                    firstname: $("#firstName").val(),
                                    email: $("#email").val(),
                                    file: file
                                });
                                popup.remove();
                            }
                        } else {
                            popup.remove();
                        }
                    }
                };

                 /* Create popup */
                popup = new M.Popup({
                    modal:true,
                    autoSize:true,
                    centered:false,
                    resize:false,
                    header:options.title,
		    parent: $('body'),
                    body:options.content ? options.content : ''

                });
                
                var el,icon,count = 0;

                /*
                 * Roll over items
                 */
                for (var i in options.value) {
                    id = M.Util.getId();
                    el = options.value[i];
                    icon = el.icon ? '<img class="middle" src="'+el.icon+'"/>&nbsp;' : '';
                    popup.append('<a href="#" class="button marged" id="'+id+'">'+icon+el.title+'</a>', 'body');

                    /*
                     * Return item value to callback on click
                     */
                    (function(d, a, c, v){
                        a.click(function(e){
                            if ($.isFunction(c)){
                                c(v);
                            }
                        });
                    })(popup, $('#'+id), options.callback, el.value);

                    count++;
                }
                
                /*
                * Show the modal window
                */
               popup.show();
               
               $.get(M.Plugins.Take5._o.licenseUrl,function(data) {
                   $('textarea').html(data);
               });
	};

        /*
         * Show site description
         * 
         * @param {OpenLayers.Feature} site
         * 
         */
        this.showSite = function(site) {

            var self = this;

            /*
             * Show site description
             */
            $('#leftCol .description').html(site.attributes.description);

	    self.selectedSite = site;

            /*
             * Asynchronously retrieve products from site
             */
            M.Util.ajax({
                url: M.Util.proxify(M.Util.getAbsoluteUrl(self.searchService + site.attributes.identifier)),
                async: true,
                dataType: "json",
                success: function(json) {

                    var i, l, firstReflectance = true, firstReflectanceTOA = true, id = M.Util.getId();

                    /*
                     * Double check if there are products
                     */
                    if (json.features && json.features.length) {

                        self.features = json.features;

                        l = self.features.length;

                        if (l > 0) {

                            /*
                             * Display products clickable thumbnails
                             * 
                             * +--------+--------+--------+
                             * |        |        |        |
                             * | thumb1 | thumb2 | thumb3 |
                             * |        |        |        |
                             * +--------+--------+--------+
                             * 
                             */
                            $('#side2').html('<div class="quickselector"><ul id="' + id + '"></ul></div>');
                            
                            for (i = 0; i < l; i++) {

                                self.features[i].id = M.Util.getId();
                                
                                /*
                                 * Activate or not
                                 */
                                (function(feature, $d) {

                                    if (feature.properties.product === "REFLECTANCE" && firstReflectance) {
                                        firstReflectance = false;
                                        $d.append('<li id="dl2a" jtitle="' + self._("Download all Level 2A products")  + '" class="thumbs"><img src="./take5/img/level2A.png"/></li>');
                                        M.tooltip.add($('#dl2a'), 's');
                                        $('#dl2a').click(function() {
                                            M.Plugins.Take5._o.displayPopupDownload(self.archivesUrl + "/" + M.Plugins.Take5._o.selectedSite.attributes.identifier+"_LEVEL1C.tar", M.Plugins.Take5._o.selectedSite.attributes.identifier + " - " + self._("Level 1C"));
                                        });
                                    }
                                    else if (feature.properties.product === "REFLECTANCETOA" && firstReflectanceTOA) {
                                        firstReflectanceTOA = false;
                                        $d.append('<li id="dl1c" jtitle="' + self._("Download all Level 1C products")  + '" class="thumbs"><img src="./take5/img/level1C.png"/></li>');
                                        M.tooltip.add($('#dl1c'), 's');
                                        $('#dl1c').click(function() {
                                            M.Plugins.Take5._o.displayPopupDownload(self.archivesUrl + "/" + M.Plugins.Take5._o.selectedSite.attributes.identifier+"_LEVEL2A.tar", M.Plugins.Take5._o.selectedSite.attributes.identifier + " - " + self._("Level 2A"));
                                        });
                                    }
                                    
                                    $d.append('<li id="' + feature.id + '" jtitle="' + self.stripTime(feature.properties.startDate) + '" class="thumbs"><img src="' + feature.properties.thumbnail + '"/></li>');
                                    M.tooltip.add($('#' + feature.id), 's');

                                    /*
                                     * Display Quicklook on click
                                     */
                                    $('#' + feature.id).click(function(e) {

                                        e.preventDefault();
                                        e.stopPropagation();
                                        
                                        self.selectedFeature = feature;
                                        
                                        for(var j=0;j<self.layers.length;j++) {
                                            M.Map.removeLayer(self.layers[j]);
                                        }
                                        self.layers.length = 0;
                                        //
                                        var layer = M.Map.addLayer(feature.properties.services.browse.layer,{
                                            noDeletionCheck: true
                                        });
                                        self.layers.push(layer);
                                        /*
                                         * Activate/Deactivate 
                                         */
                                        self.activate(feature.id);

                                        /*
                                         * Callback - set download link
                                         */
                                        $('#side1').html('<div class="center"><img id="lastql" src="' + feature.properties.quicklook + '"/><p class="title"><a id="' + id + 'dp" class="button inline download">&nbsp;&nbsp;' + self._("Download") + " : " + self.stripTime(feature.properties.startDate) + " [" + (feature.properties.product === "REFLECTANCE" ? "2A" : "1C") + "]" +'&nbsp;&nbsp;</a></p></div>');
                                        $('#' + id + 'dp').click(function() {
                                            M.Plugins.Take5._o.displayPopupDownload(M.Plugins.Take5._o.selectedFeature.properties.services.download.url, M.Plugins.Take5._o.selectedFeature.properties.identifier);
                                        });
                                        
                                        self.resize();

                                        return false;
                                    });

                                })(self.features[i], $('#' + id));

                            }

                            /*
                             * Trigger click on newest image
                             */
                            $('#' + self.features[0].id).trigger("click");

                        }
                    }
                    /*
                     * Otherwise clear info
                     */
                    else {
                        self.clear();
                    }

                    return true;

                }
            },
            {
                title: self._("Search products")
            }
            );

        };

        /*
         * Activate thumbnail for product identified by identifier
         * 
         * @param {String} identifier
         */
        this.activate = function(identifier) {
            for (var i = 0, l = this.features.length; i < l; i++) {
                $('img', $('#' + this.features[i].id)).removeClass('active');
            }
            $('img', $('#' + identifier)).addClass('active');
        };

        /*
         * Clear MMI
         */
        this.clear = function() {
            $('#side1').empty();
            $('#side2').empty();
        };

        /*
         * Take an ISO 8601 timeStamp (i.e. YYYY-MM-DDTHH:MM:SS)
         * and return simplified date (i.e. YYYY-MM-DD)
         * 
         * @param {String} timeStamp
         */
        this.stripTime = function(timeStamp) {
            if (timeStamp && timeStamp.length > 9) {
                return timeStamp.substr(0, 10);
            }
            return timeStamp;
        };

        /*
         * Translate text
         * 
         * @param {String} text
         */
        this._ = function(text) {
            var texts = [];
            texts["About"] = ["A propos"];
            texts["Initializing Take5"] = ["Take 5 : initialisation"];
            texts["Choose a site"] = ["Sélectionner un site"];
            texts["Available products"] = ["Produits disponibles"];
            texts["Search products"] = ["Recherche de produits"];
            texts["Download"] = ["Télécharger"];
            texts["Download serie"] = ["Télécharger la série"];
            texts["Download all Level 1C products"] = ["Télécharger tout le Niveau 1C"];
            texts["Download all Level 2A products"] = ["Télécharger tout le Niveau 2A"];
            texts["All right reserved"] = ["Tous droits réservés"];
            texts["Take 5 project"] = ["Projet Take 5"];
            texts["Last name"] = ["Nom"];
            texts["First name"] = ["Prénom"];
            texts["Email"] = ["Email"];
            texts["I have read the license to use and I agree to abide by the terms"] = ["J\'ai lu la license d\'utilisation et je m\'engage à en respecter les termes"];
            texts["You have to fill all the fields and accept the license"] = ["Vous devez remplir tous les champs et accepter la license"];
            
            if (M.Config.i18n.lang === 'fr') {
                return texts[text] || text;
            }

            return text;

        };

        /*
         * Set unique instance
         */
        M.Plugins.Take5._o = this;

        return this;

    };
})(window.M);
