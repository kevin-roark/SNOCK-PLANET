build:
	browserify public/javascripts/main.js > public/javascripts/build/build.js

css:
	minify public/stylesheets/style.css > public/stylesheets/style.min.css

prod:
	browserify public/javascripts/main.js > public/javascripts/build/build.js
	minify public/javascripts/build/build.js > public/javascripts/build/build.min.js
	minify public/stylesheets/style.css > public/stylesheets/style.min.css

serve:
	./bin/www
