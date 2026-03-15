/**
 * Core plagiarism analysis engine using multiple algorithms
 */

// Tokenize text into words
const tokenize = (text) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2)

// Generate n-grams from a token array
const ngrams = (tokens, n = 3) => {
  const result = []
  for (let i = 0; i <= tokens.length - n; i++) {
    result.push(tokens.slice(i, i + n).join(' '))
  }
  return result
}

// Jaccard similarity between two sets
const jaccardSimilarity = (setA, setB) => {
  const a = new Set(setA)
  const b = new Set(setB)
  const intersection = new Set([...a].filter((x) => b.has(x)))
  const union = new Set([...a, ...b])
  return union.size === 0 ? 0 : intersection.size / union.size
}

// Fingerprint a text using rolling hash (Rabin-Karp style)
const fingerprint = (text, windowSize = 5) => {
  const tokens = tokenize(text)
  const windows = ngrams(tokens, windowSize)
  return new Set(windows.map((w) => simpleHash(w)))
}

const simpleHash = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

// Known reference corpus for demonstration (simulated knowledge base)
const REFERENCE_SOURCES = [
  {
    id: 'src_1',
    title: 'Wikipedia: Artificial Intelligence',
    url: 'https://en.wikipedia.org/wiki/Artificial_intelligence',
    snippet:
      'Artificial intelligence is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals.',
    category: 'encyclopedia',
  },
  {
    id: 'src_2',
    title: 'Wikipedia: Machine Learning',
    url: 'https://en.wikipedia.org/wiki/Machine_learning',
    snippet:
      'Machine learning is a method of data analysis that automates analytical model building based on the idea that systems can learn from data.',
    category: 'encyclopedia',
  },
  {
    id: 'src_3',
    title: 'Introduction to Algorithms – MIT Press',
    url: 'https://mitpress.mit.edu/9780262046305/',
    snippet:
      'An algorithm is a finite sequence of rigorous instructions used to solve a class of specific problems or to perform a computation.',
    category: 'academic',
  },
  {
    id: 'src_4',
    title: 'Climate Change – IPCC Report',
    url: 'https://www.ipcc.ch/report/ar6/wg1/',
    snippet:
      'Climate change refers to long-term shifts in temperatures and weather patterns, mainly caused by human activities since the 1800s.',
    category: 'report',
  },
  {
    id: 'src_5',
    title: 'The Great Gatsby – F. Scott Fitzgerald',
    url: 'https://www.gutenberg.org/ebooks/64317',
    snippet:
      'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since.',
    category: 'literature',
  },
  {
    id: 'src_6',
    title: 'Deep Learning – Ian Goodfellow',
    url: 'https://www.deeplearningbook.org/',
    snippet:
      'Deep learning is a particular kind of machine learning that achieves great power and flexibility by representing the world as a nested hierarchy of concepts.',
    category: 'academic',
  },
  {
    id: 'src_7',
    title: 'NASA: Space Exploration',
    url: 'https://www.nasa.gov/topics/universe/features/webb-top-10.html',
    snippet:
      'Space exploration is the use of astronomy and space technology to explore outer space, with both robotic spacecraft and human spaceflight.',
    category: 'report',
  },
  {
    id: 'src_8',
    title: 'World Health Organization – COVID-19',
    url: 'https://www.who.int/health-topics/coronavirus',
    snippet:
      'COVID-19 is the disease caused by the SARS-CoV-2 coronavirus. WHO first learned of this new virus in December 2019.',
    category: 'report',
  },
]

/**
 * Highlight regions of the input text that appear in reference sources
 */
const findMatchingSegments = (inputText, sources) => {
  const tokens = tokenize(inputText)
  const sentences = inputText.match(/[^.!?]+[.!?]*/g) || [inputText]
  const segments = []

  sentences.forEach((sentence) => {
    const sentTokens = tokenize(sentence)
    let maxSim = 0
    let matchedSource = null

    sources.forEach((src) => {
      const srcTokens = tokenize(src.snippet)
      const sim = jaccardSimilarity(
        new Set(ngrams(sentTokens, 2)),
        new Set(ngrams(srcTokens, 2)),
      )
      if (sim > maxSim) {
        maxSim = sim
        matchedSource = src
      }
    })

    if (maxSim > 0.15 && matchedSource) {
      const startIdx = inputText.indexOf(sentence.trim())
      if (startIdx !== -1) {
        segments.push({
          text: sentence.trim(),
          start: startIdx,
          end: startIdx + sentence.trim().length,
          similarity: maxSim,
          source: matchedSource,
        })
      }
    }
  })

  return segments
}

/**
 * Main plagiarism analysis function
 */
export const analyzePlagiarism = (inputText, options = {}) => {
  const { strictMode = false } = options

  if (!inputText || inputText.trim().length < 50) {
    return {
      id: Date.now().toString(),
      overallScore: 0,
      uniqueScore: 100,
      wordCount: inputText.trim().split(/\s+/).length,
      characterCount: inputText.length,
      sentenceCount: 0,
      status: 'clean',
      sources: [],
      segments: [],
      processedAt: new Date().toISOString(),
      summary: 'Text too short to analyze.',
    }
  }

  const inputTokens = tokenize(inputText)
  const inputNgrams3 = new Set(ngrams(inputTokens, 3))
  const inputFP = fingerprint(inputText)

  // Score against each reference source
  const scoredSources = REFERENCE_SOURCES.map((src) => {
    const srcTokens = tokenize(src.snippet)
    const srcNgrams3 = new Set(ngrams(srcTokens, 3))
    const ngramSim = jaccardSimilarity(inputNgrams3, srcNgrams3)
    const srcFP = fingerprint(src.snippet)
    const fpSim = jaccardSimilarity(inputFP, srcFP)
    const wordSim = jaccardSimilarity(new Set(inputTokens), new Set(srcTokens))

    // Weighted composite similarity
    const compositeSim = ngramSim * 0.5 + fpSim * 0.3 + wordSim * 0.2
    const threshold = strictMode ? 0.03 : 0.05

    return { ...src, similarity: Math.min(compositeSim * 4, 0.95), raw: compositeSim, threshold }
  })
    .filter((s) => s.raw > s.threshold)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 6)

  // Overall plagiarism score
  const overallScore =
    scoredSources.length === 0
      ? Math.random() * 5 // small noise when clean
      : Math.min(
          scoredSources.reduce((acc, s) => acc + s.similarity, 0) / scoredSources.length * 100,
          98,
        )

  const roundedScore = Math.round(overallScore)
  const uniqueScore = 100 - roundedScore

  const sentences = inputText.match(/[^.!?]+[.!?]*/g) || []
  const segments = findMatchingSegments(inputText, scoredSources)

  let status = 'clean'
  if (roundedScore >= 70) status = 'high'
  else if (roundedScore >= 30) status = 'medium'
  else if (roundedScore >= 10) status = 'low'

  return {
    id: Date.now().toString(),
    overallScore: roundedScore,
    uniqueScore,
    wordCount: inputTokens.length,
    characterCount: inputText.length,
    sentenceCount: sentences.length,
    status,
    sources: scoredSources.map((s) => ({
      id: s.id,
      title: s.title,
      url: s.url,
      snippet: s.snippet,
      category: s.category,
      similarity: Math.round(s.similarity * 100),
    })),
    segments,
    inputText,
    processedAt: new Date().toISOString(),
    summary: generateSummary(roundedScore, scoredSources.length, inputTokens.length),
  }
}

const generateSummary = (score, sourceCount, wordCount) => {
  if (score < 10)
    return `Your text appears to be largely original. Only minor similarities detected across ${sourceCount} potential sources.`
  if (score < 30)
    return `Some similarities found in ${sourceCount} source(s). Consider rephrasing matched sections for better originality.`
  if (score < 70)
    return `Moderate plagiarism detected across ${sourceCount} source(s). A significant portion of your text matches existing content.`
  return `High plagiarism detected! ${sourceCount} matching sources found. This content heavily resembles existing published material.`
}
