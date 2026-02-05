source "https://rubygems.org"

# Use github-pages gem which includes Jekyll and compatible plugins
gem "github-pages", "~> 231", group: :jekyll_plugins

# Webrick is required for Ruby 3.0+
gem "webrick"

# Plugins adicionales
group :jekyll_plugins do
  gem "jekyll-feed"
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
end

# Windows and JRuby does not include zoneinfo files
platforms :mingw, :x64_mingw, :mswin, :jruby do
  gem "tzinfo", ">= 1", "< 3"
  gem "tzinfo-data"
end

# Performance-booster for watching directories on Windows
gem "wdm", "~> 0.1.1", :platforms => [:mingw, :x64_mingw, :mswin]

# Lock `http_parser.rb` gem to `v0.6.x` on JRuby builds
platforms :jruby do
  gem "http_parser.rb", "~> 0.6.0"
end
