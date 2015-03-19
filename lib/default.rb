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
    require 'tempfile'
    output_dir = 'output' + OutputDirectory(@item)
    file = Tempfile.new('knitr_output')
    begin
      file.write(content)
      file.close
      command = ('Rscript -e \'library(knitr);' +
                 'opts_knit$set(base.dir=normalizePath("' + output_dir +
                 '"));' +
                 'opts_chunk$set(fig.path="", fig.cap="");' +
                 'cat(knit(quiet=TRUE, output=NULL, input="' + file.path +
                 '"))\'')
      output_filename = `#{command}`
      result = IO.read(output_filename)
      File.delete(output_filename)
      return result
    ensure
      file.unlink
    end
  end
end
