# This script scrapes isotopic abundances and half-lives from the web.

ParseDuration <- function(duration_strings, unit='years') {
  # Parse a list of strings representing durations.
  #
  # Returns NA for any strings which don't match.
  #
  # Args:
  #   duration_strings:  A vector of strings, of the form "<number> <unit>",
  #     where <number> is something we can parse as a number, and <unit> is any
  #     of 's' (seconds), 'm' (minutes), 'h' (hours), 'd' (days), and 'y'
  #     (years).
  #   unit:  The unit to measure the durations in.
  #
  # Returns:
  #   A numeric vector giving the parsed duration (in the requested unit) for
  #   each string.
  require(lubridate)
  units <- list(s='seconds', m='minutes', h='hours', d='days', y='years')
  vapply(FUN.VALUE=0,
         strsplit(duration_strings, '\\s+'),
         function(x) {
           if (length(x) > 1 && x[2] %in% names(units)) {
             duration(as.numeric(x[1]), units[x[2]]) / duration(1, unit)
           } else {
             NA
           }
         })
}

ParseAbundance <- function(abundance_strings) {
  as.numeric(gsub(x=abundance_strings, perl=TRUE,
                  pattern='(%Abundance=(\\d+(\\.\\d+)?))?.*',
                  replacement='\\2'))
}

IsotopesOfElement <- function(symbol) {
  # Fetch a data.frame of isotopes of the given element which persist for
  # seconds or more.
  #
  # Uses http://ie.lbl.gov data.
  #
  # Args:
  #   symbol:  The chemical symbol of an element (or its number, if it has no
  #     symbol).
  #
  # Returns:
  #   A named list with two data.frames, 'stable' and 'unstable'.  Each
  #   data.frame consists of the corresponding isotopes of that element, with
  #   columns 'name', 'half-life' (in years), and 'abundance' (which may be NA).
  require(XML)
  the_url <- sprintf('http://ie.lbl.gov/education/parent/%s_iso.htm', symbol)
  raw_table <- readHTMLTable(the_url, as.data.frame=TRUE,
                             stringsAsFactors=FALSE,
                             trim=TRUE)[[1]][, c(1, 2, 4)]
  colnames(raw_table) <- c('Isotope', 'Halflife', 'Abundance')
  i.stable <- which(raw_table$Halflife == 'stable')

  # Turn the half-life data (which is a string) into a number we can work with
  # (a duration in years).  This excludes elements whose half-life is shorter
  # than 1 second, but for our purposes this is fine.
  raw_table$Halflife <- ParseDuration(raw_table$Halflife)

  # Parse the percent isotopic abundance for isotopes which have one.
  raw_table$Abundance <- ParseAbundance(raw_table$Abundance)

  return (list(stable=raw_table[i.stable, ],
               unstable=raw_table[which(!is.na(raw_table$Halflife)), ]))
}

# Source: http://ie.lbl.gov/education/isotopes.htm
elements <- c('H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg',
              'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca', 'Sc', 'Ti', 'V',
              'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn', 'Ga', 'Ge', 'As', 'Se',
              'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr', 'Nb', 'Mo', 'Tc', 'Ru', 'Rh',
              'Pd', 'Ag', 'Cd', 'In', 'Sn', 'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba',
              'La', 'Ce', 'Pr', 'Nd', 'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho',
              'Er', 'Tm', 'Yb', 'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt',
              'Au', 'Hg', 'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac',
              'Th', 'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm',
              'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds', 'Rg',
              '12', '14')
isotopes <- lapply(elements, IsotopesOfElement)
for (label in c('stable', 'unstable')) {
  isotope_subset <- do.call(rbind, lapply(isotopes, function(x) x[[label]]))
  write.table(isotope_subset, file=sprintf('%s_isotopes.txt', label), sep='\t',
              row.names=FALSE)
}
