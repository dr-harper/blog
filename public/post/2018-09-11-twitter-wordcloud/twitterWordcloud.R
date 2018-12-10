
## install rtweet from CRAN
# install.packages("rtweet")
# install.packages("udpipe")
# devtools::install_github("lchiffon/wordcloud2")

# Packages
library(rtweet)        # Used for extracting the tweets
library(tm)            # Text mining cleaning
library(stringr)       # Removing characters
library(wordcloud2)
library(webshot)
library(htmlwidgets)

# verify app
create_token(
  app = "twitter_wordcloud_mikey",
  consumer_key = "OAOMfX1oJaqoNAmntOICpOQLh",
  consumer_secret = "rawbjvlHVewq9hL9km25ZDo16BZULPSLP1339L0GqP7X8cepYm")

# scrape the tweets
tweets_pab <- get_timelines(c("pab_james"), n = 3200)

# Clean the data
text <- str_c(tweets_pab$text, collapse = "")
  
# extract tweets and hashtag
hashtags <- str_extract_all(text, "#\\S+")
link <- str_extract_all(text, "@\\S+")

# continue cleaning the text
text <- 
  text %>%
  str_replace_all("\\n", "") %>%
  gsub("(s?)(f|ht)tp(s?)://\\S+\\b", x = ., replacement = "") %>%
  str_replace_all("#\\S+", "") %>%
  str_replace_all("@\\S+", "") %>%
  removeWords(stopwords("english")) %>%
  removeNumbers() %>%
  removeWords(c("amp")) %>%
  stripWhitespace()

# Convert the data into a summary table
textCorpus <- 
  Corpus(VectorSource(text)) %>%
  TermDocumentMatrix() %>%
  as.matrix()

textCorpus <- sort(rowSums(textCorpus),decreasing=TRUE)
textCorpus <- data.frame(word = names(textCorpus), freq=textCorpus)

# build wordcloud 
wordcloud <- wordcloud2(data = textCorpus, minRotation = 0, maxRotation = 0, ellipticity = 0.6, color = scales::hue_pal()(10))
wordcloud


# custom colours  