# All files in the 'lib' directory will be loaded
# before nanoc starts compiling.

include Nanoc::Helpers::Blogging
include Nanoc::Helpers::LinkTo

# A 'short name' for a blog post, suitable for forming part of a URL.  It
# doesn't have to be unique, but it should be unique per date.
def ShortBlogName(item)
  title = item[item.attributes.has_key?(:short_url) ? :short_url : :title]
  title.split(%r{\W+}).join('_')
end


class KnitrFilter < Nanoc::Filter
  identifier :knitr

  def run(content, params={})
    # Escape content to fit inside R's double quotes inside bash single quotes.
    escaped_content = content.gsub(%r{\\}, "\\\\\\").gsub(%r{"}, '\"').gsub(%r{'}, "'\"'\"'").gsub(%r{\n}, "\\n")
    command = ('Rscript -e \'library(knitr); cat(knit(quiet=TRUE, text="' +
               escaped_content + '"))\'')
    `#{command}`
  end
end
