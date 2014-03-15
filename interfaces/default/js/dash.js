$(document).ready(function () {
    loadRecentMovies()
    loadRecentTVshows()
    loadRecentAlbums()
    loadDownloadHistory()
    loadNZBGetDownloadHistory()
    loadWantedMovies()
    loadNextAired();
	loadTrakt();
})
    
function loadRecentMovies () {
    if (!$('#movie-carousel').length) return
    $.getJSON(WEBDIR + 'xbmc/GetRecentMovies',function (data) {
        if (data == null) return
        $.each(data.movies, function (i, movie) {
            var itemDiv = $('<div>').addClass('item carousel-item')

            if (i == 0) itemDiv.addClass('active')

            var src = WEBDIR + 'xbmc/GetThumb?h=240&w=430&thumb='+encodeURIComponent(movie.fanart)
            itemDiv.attr('style', 'background-image: url("' + src + '")')

            itemDiv.append($('<div>').addClass('carousel-caption').click(function() {
                location.href = 'xbmc/#movies'
            }).hover(function() {
                var text = $(this).children('p').stop().slideToggle()
            }).append(
                $('<h4>').html(movie.title + ' (' + movie.year + ')'),
                $('<p>').html(
                    '<b>Runtime</b>: ' + parseSec(movie.runtime) + '<br />' +
                    '<b>Genre</b>: ' + movie.genre.join(', ') + '<br />' +
                    movie.plot
                ).hide()
            ))
            $('#movie-carousel .carousel-inner').append(itemDiv)
        })
        $('#movie-carousel').show()
    })
}
function loadRecentTVshows () {
    if (!$('#tvshow-carousel').length) return
    $.getJSON(WEBDIR + 'xbmc/GetRecentShows', function (data) {
        if (data == null) return
        $.each(data.episodes, function (i, episode) {
            var itemDiv = $('<div>').addClass('item carousel-item')

            if (i == 0) itemDiv.addClass('active')

            var src = WEBDIR + "xbmc/GetThumb?h=240&w=430&thumb="+encodeURIComponent(episode.fanart)
            itemDiv.attr('style', 'background-image: url("' + src + '")')

            itemDiv.append($('<div>').addClass('carousel-caption').click(function() {
                location.href = 'xbmc/#shows'
            }).hover(function() {
                var text = $(this).children('p').stop().slideToggle()
            }).append(
                $('<h4>').html(episode.showtitle + ': ' + episode.label),
                $('<p>').html(
                    '<b>Runtime</b>: ' + parseSec(episode.runtime) + '<br />' + episode.plot
                ).hide()
            ))
            $('#tvshow-carousel .carousel-inner').append(itemDiv)
        })
        $('#tvshow-carousel').show()
    })
}
function loadRecentAlbums () {
    if (!$('#albums-content').length) return
    $.getJSON(WEBDIR + 'xbmc/GetRecentAlbums/4', function (data) {
        if (data == null) return
        $.each(data.albums, function (i, album) {
            var imageSrc = WEBDIR + 'js/libs/holder.js/45x45/text:No cover'
            if (album.thumbnail != '') {
                imageSrc = WEBDIR + 'xbmc/GetThumb?h=45&w=45&thumb='+encodeURIComponent(album.thumbnail)
            }

            var label = album.label
            if (album.year != '0') label += ' (' + album.year + ')'

            $('#albums-content').append(
                $('<li>').addClass('media').append(
                    $('<img>').addClass('media-object pull-left img-rounded').attr('src', imageSrc),
                    $('<div>').addClass('media-body').append(
                        $('<h5>').addClass('media-heading').html(label),
                        $('<p>').text(album.artist[0])
                    )
                ).click(function(e) {
                    location.href = 'xbmc/#albums'
                })
            )
        })
        Holder.run()
        $('#albums-content').parent().show()
    })
}
function loadDownloadHistory() {
    if (!$('#downloads_table_body').length) return
    $.getJSON(WEBDIR + 'sabnzbd/GetHistory?limit=5', function (data) {
        $.each(data.history.slots, function (i, slot) {
            var status = $('<i>').addClass('icon-ok')
            if (slot.status == 'Failed') {
                status.removeClass().addClass('icon-remove').attr('title', slot.fail_message)
            }
            $('#downloads_table_body').append(
                $('<tr>').append(
                    $('<td>').html(slot.name).attr('title', slot.name),
                    $('<td>').html(status)
                )
            )
        })
    })
}
function loadNZBGetDownloadHistory() {
    if (!$('#nzbgetdownloads_table_body').length) return
    $.getJSON(WEBDIR + 'nzbget/GetHistory?limit=5', function (data) {
        $.each(data.result, function (i, slot) {
            var status = $('<i>').addClass('icon-ok')
            if (slot.ParStatus == 'Failed') {
                status.removeClass().addClass('icon-remove').attr('title', slot.fail_message)
            }
            $('#nzbgetdownloads_table_body').append(
                $('<tr>').append(
                    $('<td>').html(slot.Name).attr('title', slot.Name),
                    $('<td>').html(status)
                )
            )
        })
    })
}
function loadWantedMovies() {
    if (!$('#wantedmovies_table_body').length) return
    $.getJSON(WEBDIR + 'couchpotato/GetMovieList/active/5', function (result) {
        if (result == null) {
            $('#wantedmovies_table_body').append(
                $('<tr>').append($('<td>').html('No wanted movies found').attr('colspan', '2'))
            )
            return
        }
        $.each(result.movies, function(i, item) {
            $('#wantedmovies_table_body').append(
                $('<tr>').append(
                    $('<td>').html(item.library.info.original_title),
                    $('<td>').addClass('alignright').html(item.library.year)
                )
            )
        })
    })
}

/**
	SickBeard next airing
*/
var g_nFadeInTimeout = 1000;					// The fadeint timeout
var g_nDefaultWidgetEntryHeight = 75;			// The default episode info height (dash.css > .widgetentry)

function showEpisodeInfo(pEpisode) {
	$("#sb_epiinfo_" + pEpisode.tvdbid).html(pEpisode.show_name + " S" + pEpisode.season + "E" + pEpisode.episode + " - " + pEpisode.ep_name + " (Airs " + pEpisode.airdate + " on " + pEpisode.network + ")");
}

function loadNextAired(options) {
    $.getJSON(WEBDIR + "sickbeard/GetNextAired", function (pResult) {
        if (pResult == null || pResult.data.soon.legth == 0) {
            return;
        }
		
        $.each(pResult.data.today.concat(pResult.data.soon), function (nIndex, pEpisode) {
            $("#sickbeard")
				.append($("<div>").attr("class", "widgetentry")
						.append($("<div>")
							.attr("id", "sb_epiinfo_" + pEpisode.tvdbid)
							.attr("class", "widgetentryinfo")
							.attr("style", "padding: 5px"))
						.attr("style", "background-image: url('sickbeard/GetBanner/" + pEpisode.tvdbid + "');")
						.mouseover(function(pEvent) {
							pEvent.preventDefault();
							$("#sb_epiinfo_" + pEpisode.tvdbid).html(pEpisode.ep_plot);
							
							var nNewHeight = $("#sb_epiinfo_" + pEpisode.tvdbid).height();
							
							if (nNewHeight > $("#sb_epiinfo_" + pEpisode.tvdbid).parent().height()) {
								$("#sb_epiinfo_" + pEpisode.tvdbid).parent().height($("#sb_epiinfo_" + pEpisode.tvdbid).height());
							}
						})
						.mouseout(function(pEvent) {
							pEvent.preventDefault();
							showEpisodeInfo(pEpisode);
							$("#sb_epiinfo_" + pEpisode.tvdbid).parent().height(g_nDefaultWidgetEntryHeight);
						})
						.click(function(pEvent) {
							window.location = "sickbeard/view/" + pEpisode.tvdbid;
						})
						.fadeIn(g_nFadeInTimeout)
					);
					
			showEpisodeInfo(pEpisode);
        })
    })
}

/**
	Trakt
*/
function showShowInfo(pShow) {
	var strHTML = $("<div>")
		.append($("<img>").attr("src", pShow.images.banner))
		.append($("<img>").attr("class", "addtosickbeard")
			.attr("alt", "Add to SickBeard")
			.attr("src", "img/sickbeard.png")
			.click(function(pEvent) {
				pEvent.preventDefault();
				
				$.getJSON(WEBDIR + "sickbeard/AddShow/" + pShow.tvdb_id);
			}))
		.append($("<table>").attr("class", "modaltable")
			.append($("<tr>")
				.append($("<td>").html("<b>Title</b>"))
				.append($("<td>").text(pShow.title))
			).append($("<tr>")
				.append($("<td>").html("<b>Overview</b>"))
				.append($("<td>").text(pShow.overview))
			).append($("<tr>")
				.append($("<td>").html("<b>Rating</b>"))
				.append($("<td>").text(pShow.ratings.percentage + "% (" + pShow.ratings.loved + " out of " + pShow.ratings.votes + " votes)"))
			).append($("<tr>")
				.append($("<td>").html("<b>Status</b>"))
				.append($("<td>").text(pShow.status))
			).append($("<tr>")
				.append($("<td>").html("<b>Network</b>"))
				.append($("<td>").text(pShow.network))
			).append($("<tr>")
				.append($("<td>").html("<b>Year</b>"))
				.append($("<td>").text(pShow.year))
			).append($("<tr>")
				.append($("<td>").html("<b>Runtime</b>"))
				.append($("<td>").text(pShow.runtime + " minutes"))
			).append($("<tr>")
				.append($("<td>").html("<b>Country</b>"))
				.append($("<td>").text(pShow.country))
			).append($("<tr>")
				.append($("<td>").html("<b>Watchers</b>"))
				.append($("<td>").text(pShow.watchers))
			)
		);
	
	showModal(pShow.title, strHTML, []);
}

function addShowToWidget(pWidget, pItem) {
	pWidget
		.append($("<div>").attr("class", "widgetentry")
				.append($("<div>")
					.attr("id", "trakt_epiinfo_" + pItem.tvdb_id)
					.attr("class", "widgetentryinfo"))
				.attr("style", "background-image: url('" + pItem.images.banner + "');")
				.click(function(pEvent) {
					pEvent.preventDefault();
					showShowInfo(pItem);
				})
				.fadeIn(g_nFadeInTimeout)
			);
}

function loadTraktInfo(strRequest, pWidget) {
	$.getJSON(WEBDIR + "trakt/" + strRequest, function (pResult) {
        if (pResult == null) {
            return;
        }
		
		$.each(pResult, function(nIndex, pItem) {
			addShowToWidget(pWidget, pItem);
			
			if (nIndex > 4) {
				return false;
			}
		});
	});
}

function loadTrakt() {
	loadTraktInfo("GetTrending/shows", $("#trakt_trending_shows"));
	loadTraktInfo("GetRecommendations/shows", $("#trakt_recommended_shows"));
}