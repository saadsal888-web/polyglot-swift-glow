-- إضافة عمود التصنيف لجدول الكلمات
ALTER TABLE words ADD COLUMN category TEXT;

-- تصنيف الضمائر
UPDATE words SET category = 'pronouns' WHERE word_en IN ('I', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those');

-- تصنيف ضمائر الملكية
UPDATE words SET category = 'possessives' WHERE word_en IN ('my', 'your', 'his', 'her', 'our', 'their', 'its', 'mine', 'yours', 'hers', 'ours', 'theirs');

-- تصنيف أفعال الكينونة
UPDATE words SET category = 'verbs_be' WHERE word_en IN ('be', 'am', 'is', 'are', 'was', 'were', 'been', 'being');

-- تصنيف أفعال الملكية
UPDATE words SET category = 'verbs_have' WHERE word_en IN ('have', 'has', 'had', 'having');

-- تصنيف أفعال الحركة
UPDATE words SET category = 'verbs_motion' WHERE word_en IN ('go', 'come', 'run', 'walk', 'move', 'leave', 'arrive', 'return', 'enter', 'exit', 'travel', 'fly', 'drive', 'ride', 'swim', 'jump', 'fall', 'rise', 'climb', 'follow');

-- تصنيف أفعال الفعل العام
UPDATE words SET category = 'verbs_action' WHERE word_en IN ('do', 'make', 'take', 'give', 'get', 'put', 'set', 'use', 'try', 'help', 'show', 'find', 'keep', 'let', 'begin', 'start', 'stop', 'end', 'finish', 'continue', 'open', 'close', 'turn', 'change', 'fix', 'break', 'build', 'cut', 'hold', 'carry', 'bring', 'send', 'receive', 'pick', 'drop', 'throw', 'catch', 'push', 'pull', 'lift', 'hit', 'touch', 'reach', 'meet', 'join', 'leave', 'stay', 'wait', 'stand', 'sit', 'lie', 'sleep', 'wake', 'rest', 'work', 'play', 'study', 'learn', 'teach', 'read', 'write', 'speak', 'talk', 'say', 'tell', 'ask', 'answer', 'call', 'hear', 'listen', 'see', 'look', 'watch', 'notice', 'feel', 'smell', 'taste');

-- تصنيف أفعال التفكير
UPDATE words SET category = 'verbs_mental' WHERE word_en IN ('think', 'know', 'believe', 'understand', 'remember', 'forget', 'learn', 'decide', 'choose', 'plan', 'hope', 'wish', 'want', 'need', 'like', 'love', 'hate', 'prefer', 'enjoy', 'wonder', 'imagine', 'dream', 'mean', 'realize', 'recognize', 'notice', 'consider', 'expect', 'suppose', 'guess', 'doubt', 'trust', 'worry', 'care', 'mind');

-- تصنيف العائلة
UPDATE words SET category = 'family' WHERE word_en IN ('mother', 'father', 'mom', 'dad', 'parent', 'parents', 'sister', 'brother', 'son', 'daughter', 'child', 'children', 'baby', 'grandmother', 'grandfather', 'grandma', 'grandpa', 'grandparent', 'grandparents', 'aunt', 'uncle', 'cousin', 'niece', 'nephew', 'wife', 'husband', 'spouse', 'family', 'relative', 'relatives');

-- تصنيف الناس
UPDATE words SET category = 'people' WHERE word_en IN ('man', 'woman', 'person', 'people', 'boy', 'girl', 'adult', 'teenager', 'kid', 'friend', 'neighbor', 'stranger', 'guest', 'host', 'customer', 'client', 'member', 'group', 'team', 'crowd', 'audience', 'public');

-- تصنيف الوقت
UPDATE words SET category = 'time' WHERE word_en IN ('time', 'day', 'week', 'month', 'year', 'today', 'tomorrow', 'yesterday', 'now', 'then', 'soon', 'later', 'early', 'late', 'morning', 'afternoon', 'evening', 'night', 'midnight', 'noon', 'hour', 'minute', 'second', 'moment', 'period', 'season', 'spring', 'summer', 'fall', 'autumn', 'winter', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'past', 'present', 'future', 'always', 'never', 'sometimes', 'often', 'usually', 'rarely', 'ever', 'already', 'still', 'yet', 'ago', 'before', 'after', 'during', 'while', 'until', 'since', 'when');

-- تصنيف الألوان
UPDATE words SET category = 'colors' WHERE word_en IN ('color', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'gold', 'silver', 'dark', 'light', 'bright', 'colorful');

-- تصنيف الأرقام
UPDATE words SET category = 'numbers' WHERE word_en IN ('number', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety', 'hundred', 'thousand', 'million', 'billion', 'first', 'second', 'third', 'fourth', 'fifth', 'last', 'next', 'half', 'quarter', 'double', 'triple', 'single', 'pair', 'dozen', 'few', 'many', 'much', 'more', 'most', 'less', 'least', 'some', 'any', 'all', 'every', 'each', 'both', 'either', 'neither', 'none', 'zero', 'once', 'twice');

-- تصنيف الطعام والشراب
UPDATE words SET category = 'food' WHERE word_en IN ('food', 'eat', 'drink', 'water', 'bread', 'rice', 'meat', 'fish', 'chicken', 'egg', 'milk', 'cheese', 'butter', 'fruit', 'apple', 'banana', 'orange', 'vegetable', 'potato', 'tomato', 'onion', 'carrot', 'salad', 'soup', 'meal', 'breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'cake', 'cookie', 'chocolate', 'candy', 'sugar', 'salt', 'pepper', 'oil', 'sauce', 'juice', 'tea', 'coffee', 'wine', 'beer', 'hungry', 'thirsty', 'full', 'taste', 'cook', 'bake', 'fry', 'boil', 'recipe', 'restaurant', 'menu', 'order', 'serve', 'dish', 'plate', 'bowl', 'cup', 'glass', 'bottle', 'spoon', 'fork', 'knife');

-- تصنيف الأماكن
UPDATE words SET category = 'places' WHERE word_en IN ('place', 'house', 'home', 'room', 'kitchen', 'bathroom', 'bedroom', 'living room', 'office', 'building', 'apartment', 'floor', 'door', 'window', 'wall', 'roof', 'garden', 'yard', 'street', 'road', 'city', 'town', 'village', 'country', 'world', 'area', 'region', 'location', 'address', 'school', 'university', 'college', 'hospital', 'hotel', 'restaurant', 'shop', 'store', 'market', 'mall', 'bank', 'library', 'museum', 'theater', 'cinema', 'park', 'beach', 'mountain', 'river', 'lake', 'sea', 'ocean', 'forest', 'desert', 'island', 'bridge', 'station', 'airport', 'church', 'mosque', 'temple');

-- تصنيف الجسم
UPDATE words SET category = 'body' WHERE word_en IN ('body', 'head', 'face', 'hair', 'eye', 'eyes', 'ear', 'ears', 'nose', 'mouth', 'lip', 'lips', 'tooth', 'teeth', 'tongue', 'neck', 'shoulder', 'shoulders', 'arm', 'arms', 'hand', 'hands', 'finger', 'fingers', 'chest', 'stomach', 'back', 'leg', 'legs', 'knee', 'knees', 'foot', 'feet', 'toe', 'toes', 'skin', 'bone', 'bones', 'blood', 'heart', 'brain', 'muscle', 'muscles');

-- تصنيف المشاعر
UPDATE words SET category = 'emotions' WHERE word_en IN ('feel', 'feeling', 'emotion', 'happy', 'sad', 'angry', 'afraid', 'scared', 'worried', 'nervous', 'excited', 'surprised', 'shocked', 'confused', 'tired', 'bored', 'interested', 'proud', 'ashamed', 'embarrassed', 'jealous', 'lonely', 'calm', 'relaxed', 'stressed', 'frustrated', 'disappointed', 'hopeful', 'grateful', 'sorry', 'glad', 'pleased', 'satisfied', 'comfortable', 'uncomfortable', 'pain', 'hurt', 'sick', 'healthy', 'well', 'fine', 'okay', 'mood', 'cry', 'laugh', 'smile', 'frown');

-- تصنيف الصفات العامة
UPDATE words SET category = 'adjectives_general' WHERE word_en IN ('good', 'bad', 'great', 'nice', 'fine', 'beautiful', 'ugly', 'pretty', 'handsome', 'cute', 'lovely', 'wonderful', 'amazing', 'excellent', 'perfect', 'terrible', 'horrible', 'awful', 'poor', 'rich', 'expensive', 'cheap', 'free', 'easy', 'hard', 'difficult', 'simple', 'complex', 'complicated', 'clear', 'obvious', 'strange', 'weird', 'normal', 'usual', 'common', 'rare', 'special', 'important', 'necessary', 'possible', 'impossible', 'true', 'false', 'real', 'fake', 'right', 'wrong', 'correct', 'incorrect', 'sure', 'certain', 'uncertain', 'lucky', 'unlucky');

-- تصنيف الصفات الحجمية
UPDATE words SET category = 'adjectives_size' WHERE word_en IN ('big', 'small', 'large', 'little', 'tiny', 'huge', 'giant', 'tall', 'short', 'long', 'wide', 'narrow', 'thick', 'thin', 'deep', 'shallow', 'high', 'low', 'heavy', 'light', 'fat', 'slim');

-- تصنيف الصفات الحرارية
UPDATE words SET category = 'adjectives_temperature' WHERE word_en IN ('hot', 'cold', 'warm', 'cool', 'freezing', 'boiling');

-- تصنيف أدوات الاستفهام
UPDATE words SET category = 'question_words' WHERE word_en IN ('what', 'who', 'where', 'when', 'why', 'how', 'which', 'whose', 'whom');

-- تصنيف حروف الجر
UPDATE words SET category = 'prepositions' WHERE word_en IN ('in', 'on', 'at', 'to', 'from', 'by', 'with', 'without', 'for', 'about', 'of', 'off', 'up', 'down', 'out', 'into', 'onto', 'over', 'under', 'above', 'below', 'between', 'among', 'through', 'across', 'around', 'behind', 'beside', 'near', 'far', 'inside', 'outside', 'before', 'after', 'during', 'since', 'until', 'against', 'along', 'toward', 'towards', 'except', 'beyond', 'within', 'throughout');

-- تصنيف أدوات الربط
UPDATE words SET category = 'conjunctions' WHERE word_en IN ('and', 'or', 'but', 'so', 'because', 'if', 'when', 'while', 'although', 'though', 'unless', 'until', 'whether', 'as', 'since', 'before', 'after', 'that', 'than', 'however', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'otherwise', 'meanwhile', 'instead', 'besides', 'either', 'neither', 'both', 'not only', 'but also');

-- تصنيف المواصلات
UPDATE words SET category = 'transport' WHERE word_en IN ('car', 'bus', 'train', 'plane', 'airplane', 'boat', 'ship', 'bicycle', 'bike', 'motorcycle', 'taxi', 'truck', 'van', 'subway', 'metro', 'helicopter', 'vehicle', 'traffic', 'road', 'highway', 'street', 'drive', 'ride', 'fly', 'travel', 'trip', 'journey', 'ticket', 'passport', 'luggage', 'baggage', 'suitcase');

-- تصنيف الملابس
UPDATE words SET category = 'clothing' WHERE word_en IN ('clothes', 'clothing', 'wear', 'shirt', 'pants', 'trousers', 'jeans', 'dress', 'skirt', 'suit', 'jacket', 'coat', 'sweater', 'hat', 'cap', 'shoes', 'boots', 'socks', 'gloves', 'scarf', 'tie', 'belt', 'pocket', 'button', 'zipper', 'uniform', 'costume', 'fashion', 'style');

-- تصنيف الطقس
UPDATE words SET category = 'weather' WHERE word_en IN ('weather', 'rain', 'snow', 'sun', 'sunny', 'rainy', 'cloudy', 'cloud', 'wind', 'windy', 'storm', 'thunder', 'lightning', 'fog', 'foggy', 'ice', 'icy', 'temperature', 'degree', 'forecast', 'climate', 'dry', 'wet', 'humid');

-- تصنيف التعليم
UPDATE words SET category = 'education' WHERE word_en IN ('school', 'class', 'classroom', 'lesson', 'course', 'subject', 'study', 'learn', 'teach', 'teacher', 'student', 'pupil', 'professor', 'education', 'knowledge', 'skill', 'test', 'exam', 'examination', 'grade', 'score', 'pass', 'fail', 'homework', 'assignment', 'project', 'research', 'book', 'textbook', 'notebook', 'pen', 'pencil', 'paper', 'page', 'read', 'write', 'spell', 'question', 'answer', 'explain', 'understand', 'practice', 'exercise', 'example', 'problem', 'solution', 'university', 'college', 'degree', 'diploma', 'certificate', 'graduate', 'graduation');

-- تصنيف العمل
UPDATE words SET category = 'work' WHERE word_en IN ('work', 'job', 'career', 'profession', 'occupation', 'employee', 'employer', 'boss', 'manager', 'worker', 'staff', 'colleague', 'coworker', 'office', 'company', 'business', 'industry', 'factory', 'salary', 'wage', 'pay', 'earn', 'hire', 'fire', 'retire', 'interview', 'resume', 'experience', 'skill', 'task', 'project', 'meeting', 'schedule', 'deadline', 'report', 'presentation', 'department', 'position', 'promote', 'promotion');

-- للكلمات التي لم تُصنف بعد، نعطيها تصنيف عام حسب المستوى
UPDATE words SET category = 'general_a1' WHERE category IS NULL AND difficulty = 'A1';
UPDATE words SET category = 'general_a2' WHERE category IS NULL AND difficulty = 'A2';
UPDATE words SET category = 'general_b1' WHERE category IS NULL AND difficulty = 'B1';
UPDATE words SET category = 'general_b2' WHERE category IS NULL AND difficulty = 'B2';
UPDATE words SET category = 'general_c1' WHERE category IS NULL AND difficulty = 'C1';
UPDATE words SET category = 'general_c2' WHERE category IS NULL AND difficulty = 'C2';
UPDATE words SET category = 'general' WHERE category IS NULL;