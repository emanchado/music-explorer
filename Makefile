all: index.html manifest.appcache

index.html: ../music-explorer/public/index.html
	sed -e 's/<html/<html manifest="manifest.appcache"/' $< >$@

manifest.appcache: js/bundle.js
	echo "CACHE MANIFEST" >manifest.appcache
	echo "# Revision: `git show --format=%h --quiet`" >>manifest.appcache
	find js/ >>manifest.appcache
	find css/ >>manifest.appcache
	find notes/ >>manifest.appcache
