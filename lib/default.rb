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

# Custom logic for the output directory.
#
# We put it here so that other helpers can reference this logic too.
def OutputDirectory(item)
  if item.nil?
    return ''
  end
  case item.identifier
  when %r{/blog/.+}
    root = item.attributes.has_key?(:created_at) ?
      attribute_to_time(item[:created_at]).strftime('/blog/%Y/%m/%d') : '/draft'
    return [root, ShortBlogName(item)].join('/')
  else
    return item.identifier
  end
end

class KnitrFilter < Nanoc::Filter
  identifier :knitr

  def run(content, params={})
    # Escape content to fit inside R's double quotes inside bash single quotes.
    output_dir = 'output' + OutputDirectory(@item)
    escaped_content = content.gsub(%r{\\}, "\\\\\\").gsub(%r{"}, '\"').gsub(%r{'}, "'\"'\"'").gsub(%r{\n}, "\\n")
    command = ('Rscript -e \'library(knitr);' +
               'opts_knit$set(base.dir=normalizePath("' + output_dir + '"));' +
               'opts_chunk$set(fig.path="");' +
               'cat(knit(quiet=TRUE, output=NULL, input="' + escaped_content +
               '"))\'')
    `#{command}`
  end
end
