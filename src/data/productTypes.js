// Product types within each category, so a phone, a pair of headphones and a
// console stop getting the same "how often will you use it?" questions.
//
// Each type has:
//   id        stable key, returned by the classifier as `productType`
//   keywords  matched like category keywords (lowercase, singular, word-bounded)
//   item      what {item} becomes in labels — always singular, with its
//             determiner, so templates never break verb agreement
//   questions per-question rewording, keyed by question id. A string replaces the
//             label; an object may also bring reason phrases [negative, positive]
//             and a breakdown `signal`, for when the rewording changes what the
//             answer means.
//
// Rewording never changes a question's id, type or options, and must keep the
// scorer's polarity: if "yes" was the good answer, it still is. Types are
// checked in order and earlier types win ties.

export const PRODUCT_TYPES = {
  // Polarity — usage: more often is better · currentAge: older is better ·
  // productivity: higher is better · researched: more is better.
  tech: [
    {
      id: 'phone',
      keywords: ['phone', 'smartphone', 'iphone', 'android', 'pixel', 'samsung galaxy'],
      item: 'this phone',
      questions: {
        usage: "How often will you use what's new on this phone?",
        currentAge: 'How old is the phone you have now?',
        productivity: {
          label: 'How much is your current phone actually holding you back?',
          phrases: ["your current phone isn't really holding you back", 'your current phone is genuinely holding you back'],
          signal: 'Current phone holds you back',
        },
        researched: "How much have you compared it against last year's model or a cheaper phone?",
        canWait: 'Could you keep your current phone another month without it affecting your life?',
      },
    },
    {
      id: 'tablet',
      keywords: ['tablet', 'ipad', 'kindle', 'e reader'],
      item: 'this tablet',
      questions: {
        usage: 'How often will you pick up this tablet instead of your phone or laptop?',
        currentAge: 'How old is the tablet or e-reader you have now?',
        productivity: {
          label: "How much will it do that your phone and laptop can't?",
          phrases: ['your phone and laptop already cover it', "it does things your other devices can't"],
          signal: 'Does what your other devices cannot',
        },
      },
    },
    {
      id: 'computer',
      keywords: ['laptop', 'macbook', 'notebook', 'desktop', 'pc', 'computer'],
      item: 'this computer',
      questions: {
        usage: 'How often will you use this computer for work, study or projects that need it?',
        currentAge: 'How old is the computer you use now?',
        productivity: 'How much faster will this computer make your work or study?',
        researched: 'How much have you compared specs and prices against cheaper models?',
      },
    },
    {
      id: 'headphones',
      keywords: ['headphone', 'earphone', 'earbud', 'airpod', 'airpods', 'bose', 'sony wh'],
      item: 'this pair of headphones',
      questions: {
        usage: 'How often will you wear this pair of headphones?',
        currentAge: 'How old are the headphones you use now?',
        productivity: {
          label: 'How much will better sound or noise cancelling improve your day?',
          phrases: ["better sound won't change your day much", 'better sound will genuinely improve your day'],
          signal: 'Day-to-day difference',
        },
        researched: 'How much have you compared them against cheaper headphones that sound similar?',
      },
    },
    {
      id: 'console',
      keywords: [
        'console', 'playstation', 'ps5', 'xbox', 'nintendo', 'switch', 'steam deck',
        'vr headset', 'oculus', 'quest',
      ],
      item: 'this console',
      questions: {
        usage: 'How often will you actually play on this console?',
        currentAge: 'How old is the console or gaming setup you have now?',
        productivity: {
          label: 'How much do you game now, honestly? (1 = barely, 5 = most days)',
          phrases: ['you barely game as it is', 'gaming is already a big part of your week'],
          signal: 'Already games a lot',
        },
        researched: 'How much have you compared bundle deals or a second-hand console?',
      },
    },
    {
      id: 'screen',
      keywords: ['tv', 'television', 'monitor', 'display', 'projector'],
      item: 'this screen',
      questions: {
        usage: "How often will you be watching or working on this screen?",
        currentAge: 'How old is the screen you use now?',
        productivity: {
          label: 'How big a step up is it from the screen you have now?',
          phrases: ["it's barely better than what you have", "it's a big step up from what you have"],
          signal: 'Step up from current screen',
        },
        researched: 'How much have you compared sizes and prices against cheaper screens?',
      },
    },
    {
      id: 'camera',
      keywords: ['camera', 'dslr', 'mirrorless', 'gopro', 'drone'],
      item: 'this camera',
      questions: {
        usage: 'How often will you actually go out and shoot with this camera?',
        currentAge: 'How old is the camera you shoot with now? (Your phone counts.)',
        productivity: {
          label: 'How much better will your photos be than with your phone?',
          phrases: ['your phone camera already does the job', "it's a real step up from your phone"],
          signal: 'Better than your phone',
        },
      },
    },
    {
      id: 'watch',
      keywords: ['smartwatch', 'apple watch', 'fitbit', 'garmin'],
      item: 'this watch',
      questions: {
        usage: 'How often will you actually wear this watch?',
        currentAge: 'How old is the watch or tracker you wear now?',
        productivity: {
          label: 'How much will its health or fitness tracking change what you do?',
          phrases: ["the tracking won't change what you do", 'the tracking will genuinely change your habits'],
          signal: 'Changes your habits',
        },
      },
    },
  ],

  // Polarity — occasions: more often is better · wardrobeGap: yes is good ·
  // matchOutfits: more is better · season: in season / year-round is better.
  fashion: [
    {
      id: 'shoes',
      keywords: ['shoe', 'sneaker', 'trainer', 'boot', 'heel', 'sandal', 'loafer'],
      item: 'this pair of shoes',
      questions: {
        occasions: 'How many times a month will you wear this pair?',
        wardrobeGap: 'Is there a job none of the shoes you own can do?',
        matchOutfits: 'How many of your outfits will this pair actually go with?',
        season: "Are they right for the weather you're about to get?",
      },
    },
    {
      id: 'outerwear',
      keywords: ['jacket', 'coat', 'blazer', 'parka', 'trench'],
      item: 'this jacket',
      questions: {
        wardrobeGap: "Is there weather or an occasion your current jackets don't cover?",
        season: 'Is it the right season for this jacket?',
      },
    },
    {
      id: 'formal',
      keywords: ['suit', 'dress', 'gown'],
      item: 'this outfit',
      questions: {
        occasions: 'How many times a month will you realistically wear this outfit?',
        wardrobeGap: "Do you have an event coming up that nothing you own fits?",
        matchOutfits: 'How many shoes and accessories you already own does it work with?',
      },
    },
    {
      id: 'bag',
      keywords: ['handbag', 'purse', 'bag', 'backpack', 'tote', 'wallet'],
      item: 'this bag',
      questions: {
        occasions: 'How often will you carry this bag per month?',
        wardrobeGap: "Does it do something none of your current bags can?",
        matchOutfits: 'How many of your outfits does this bag work with?',
        season: 'Is this bag right for now, or for year-round use?',
      },
    },
    {
      id: 'jewellery',
      keywords: ['jewellery', 'jewelry', 'necklace', 'bracelet', 'earring', 'ring'],
      item: 'this piece of jewellery',
      questions: {
        occasions: 'How often will you wear this piece per month?',
        wardrobeGap: "Is it different from the jewellery you already own?",
        matchOutfits: 'How many of your outfits does it go with?',
      },
    },
  ],

  // Polarity — spaceFit: yes is good · usageFrequency: more often is better ·
  // lifestyle: higher is better · quality: mid-range is best.
  home: [
    {
      id: 'furniture',
      keywords: [
        'sofa', 'couch', 'armchair', 'chair', 'table', 'desk', 'bed', 'mattress', 'dresser',
        'shelf', 'bookshelf', 'cupboard', 'drawer', 'wardrobe cabinet', 'furniture',
      ],
      item: 'this piece of furniture',
      questions: {
        spaceFit: 'Have you measured the space, and will it fit through the door?',
        usageFrequency: 'How often will you actually sit on, sleep on or use it?',
        lifestyle: 'How well does it suit the way your home actually gets used?',
      },
    },
    {
      id: 'appliance',
      keywords: [
        'fridge', 'refrigerator', 'freezer', 'oven', 'stove', 'microwave', 'dishwasher',
        'washing machine', 'dryer', 'vacuum', 'hoover', 'air fryer', 'blender', 'mixer',
        'toaster', 'kettle', 'coffee machine', 'espresso', 'heater', 'air conditioner', 'fan',
        'humidifier', 'purifier', 'rice cooker', 'bread maker', 'milk frother', 'egg cooker',
      ],
      item: 'this appliance',
      questions: {
        spaceFit: 'Do you have counter or floor space for this appliance?',
        usageFrequency: 'How often will you actually use this appliance?',
        lifestyle: {
          label: 'How much time or effort will it save you each week?',
          phrases: ["it won't save you much time", "it'll save you real time every week"],
          signal: 'Time it saves',
        },
      },
    },
    {
      id: 'decor',
      keywords: [
        'lamp', 'light fixture', 'chandelier', 'rug', 'carpet', 'curtain', 'blind', 'mirror',
        'vase', 'plant pot', 'painting', 'poster', 'frame', 'candle', 'cushion',
      ],
      item: 'this piece of decor',
      questions: {
        spaceFit: 'Do you already have a spot picked out for it?',
        usageFrequency: "How often will you actually notice or use it?",
        lifestyle: {
          label: "How well does it fit the style of the room it's going in?",
          phrases: ["it doesn't suit the room", 'it suits the room'],
          signal: 'Fits the room',
        },
      },
    },
    {
      id: 'tool',
      keywords: ['tool', 'drill'],
      item: 'this tool',
      questions: {
        spaceFit: 'Do you have somewhere to store this tool?',
        usageFrequency: 'How often will you use this tool for real jobs?',
        lifestyle: {
          label: 'How many jobs do you actually have lined up for it?',
          phrases: ['you have no real jobs lined up for it', 'you have real jobs lined up for it'],
          signal: 'Jobs lined up',
        },
      },
    },
  ],

  // Polarity — budget: easily is best · healthy: higher is better ·
  // alternatives: YES is bad · cravingDuration: longer is better.
  food: [
    {
      id: 'takeaway',
      keywords: [
        'pizza', 'burger', 'sushi', 'kebab', 'taco', 'burrito', 'fries', 'ramen', 'curry',
        'takeaway', 'takeout', 'delivery',
      ],
      item: 'this takeaway',
      questions: {
        budget: 'How does this order fit your food budget this week?',
        alternatives: 'Could you make something similar at home for less?',
        cravingDuration: 'How long have you been craving it?',
      },
    },
    {
      id: 'restaurant',
      keywords: ['restaurant', 'dinner', 'lunch', 'breakfast', 'brunch', 'meal'],
      item: 'this meal out',
      questions: {
        budget: 'How does eating out fit your food budget this month?',
        alternatives: 'Is there a cheaper place that would make you just as happy?',
        cravingDuration: 'How long have you been looking forward to this meal?',
      },
    },
    {
      id: 'treat',
      keywords: [
        'chocolate', 'candy', 'sweet', 'dessert', 'ice cream', 'gelato', 'cake', 'cookie',
        'biscuit', 'pastry', 'croissant', 'snack', 'crisp', 'chip',
      ],
      item: 'this treat',
      questions: {
        healthy: 'Be honest: how healthy is this treat? (1–5)',
        alternatives: 'Is there something cheaper that would hit the same spot?',
        cravingDuration: 'Have you wanted this treat for a while, or did you just see it?',
      },
    },
    {
      id: 'drink',
      keywords: ['coffee', 'tea', 'smoothie', 'juice', 'soda', 'soft drink', 'energy drink'],
      item: 'this drink',
      questions: {
        healthy: 'How healthy is this drink? (1–5)',
        alternatives: 'Could you make it at home or at work for less?',
      },
    },
    {
      id: 'supplement',
      keywords: ['supplement', 'protein bar'],
      item: 'this supplement',
      questions: {
        healthy: {
          label: 'How much do you actually need it for your health? (1–5)',
          phrases: ["you don't really need it for your health", 'it genuinely supports your health'],
          signal: 'Health need',
        },
        alternatives: 'Is there a cheaper brand with the same ingredients?',
      },
    },
    // Last, so "milk chocolate" or "eggs at brunch" land on the treat or meal
    // type rather than here.
    {
      id: 'staple',
      keywords: [
        'milk', 'bread', 'loaf', 'egg', 'rice', 'flour', 'sugar', 'salt', 'cooking oil',
        'butter', 'oat', 'cereal', 'pasta', 'potato', 'potatoes', 'onion', 'tomato',
        'tomatoes', 'banana', 'fruit', 'vegetable', 'yoghurt', 'yogurt', 'grocery', 'groceries',
      ],
      item: 'it',
      questions: {
        alternatives: 'Is the same thing cheaper at another shop nearby?',
      },
    },
  ],

  // Polarity — consistency: yes is good · routine: yes is good ·
  // spaceForIt: yes is good · alternatives: none is best, free options worst.
  fitness: [
    {
      id: 'membership',
      keywords: ['gym membership', 'gym', 'personal trainer', 'crossfit', 'yoga', 'pilates'],
      item: 'this membership',
      questions: {
        consistency: 'The last time you had a membership or classes, did you keep going?',
        routine: 'Do you already work out at least once a week?',
        spaceForIt: 'Is it close enough to get to without excuses?',
        alternatives: 'How many cheaper ways are there to train (home workouts, running, a cheaper gym)?',
      },
    },
    {
      id: 'equipment',
      keywords: [
        'dumbbell', 'barbell', 'kettlebell', 'weight plate', 'weight bench', 'squat rack',
        'home gym', 'treadmill', 'exercise bike', 'spin bike', 'peloton', 'rowing machine',
        'elliptical', 'cross trainer', 'yoga mat', 'resistance band', 'pull up bar',
        'jump rope', 'skipping rope', 'foam roller', 'massage gun', 'punching bag',
      ],
      item: 'this piece of equipment',
      questions: {
        consistency: 'Did your last piece of home equipment get used, or become a clothes rack?',
        routine: 'Do you have a workout routine this equipment fits into?',
        spaceForIt: 'Do you have the floor space at home to set it up and leave it out?',
        alternatives: 'How many cheaper ways are there to do the same workout?',
      },
    },
    {
      id: 'bike',
      keywords: ['bicycle', 'bike', 'road bike', 'mountain bike'],
      item: 'this bike',
      questions: {
        consistency: 'Did you actually ride the last bike you owned?',
        routine: 'Will it replace trips or rides you already do every week?',
        spaceForIt: 'Do you have a safe, dry place to keep this bike?',
        alternatives: 'How many cheaper options are there (second-hand, bike share, your old bike)?',
      },
    },
    {
      id: 'gear',
      keywords: [
        'running shoe', 'gym bag', 'cleat', 'boxing glove', 'climbing shoe', 'harness', 'helmet',
        'goggles', 'tennis racket', 'racquet', 'golf club', 'ski', 'snowboard', 'surfboard',
        'skateboard',
      ],
      item: 'this gear',
      questions: {
        consistency: 'Have you stuck with this sport for more than a few months?',
        routine: 'Do you already play or train regularly?',
        spaceForIt: 'Do you have somewhere to actually do it (a club, court, track or slope)?',
        alternatives: 'How many cheaper options are there (rental, second-hand, entry-level)?',
      },
    },
  ],

  // Polarity — usageFrequency: more often is better · tested: yes is good ·
  // dupeAvailable: YES is bad · finishExisting: yes is good.
  beauty: [
    {
      id: 'skincare',
      keywords: [
        'moisturiser', 'moisturizer', 'serum', 'cleanser', 'toner', 'face mask', 'sunscreen',
        'spf', 'retinol', 'niacinamide', 'hyaluronic', 'exfoliant', 'face cream', 'eye cream',
        'body lotion', 'skincare',
      ],
      item: 'this skincare product',
      questions: {
        tested: 'Have you patch-tested it or tried a sample on your skin?',
        dupeAvailable: 'Is there a cheaper product with the same active ingredients?',
        finishExisting: 'Have you finished the product it would replace in your routine?',
      },
    },
    {
      id: 'makeup',
      keywords: [
        'lipstick', 'lip gloss', 'foundation', 'concealer', 'powder', 'blush', 'bronzer',
        'highlighter', 'contour', 'eyeshadow', 'eyeliner', 'mascara', 'brow', 'nail polish',
        'makeup', 'cosmetic',
      ],
      item: 'this makeup',
      questions: {
        tested: 'Have you swatched it or tried this shade in person?',
        dupeAvailable: 'Is there a cheaper dupe in the same shade?',
        finishExisting: 'Have you used up the similar makeup you already own?',
      },
    },
    {
      id: 'fragrance',
      keywords: ['perfume', 'cologne', 'fragrance', 'eau de'],
      item: 'this fragrance',
      questions: {
        tested: 'Have you worn it on your skin for a full day?',
        dupeAvailable: 'Is there a cheaper fragrance that smells close?',
        usageFrequency: 'How often will you actually wear it?',
        finishExisting: 'Have you finished a bottle you already own?',
      },
    },
    {
      id: 'grooming',
      keywords: ['hair dryer', 'straightener', 'curling iron', 'clipper', 'razor', 'shaver', 'trimmer'],
      item: 'this tool',
      questions: {
        tested: 'Have you tried this tool, or read reviews from people who use it?',
        finishExisting: {
          label: 'Has your current one actually broken or stopped doing the job?',
          phrases: ['your current one still works', 'your current one has had it'],
          signal: 'Current one worn out',
        },
      },
    },
    {
      id: 'salon',
      keywords: ['manicure', 'pedicure', 'facial', 'salon', 'haircut', 'spa'],
      item: 'this appointment',
      questions: {
        tested: "Have you been to this place, or seen their work, before?",
        dupeAvailable: 'Is there a cheaper place that does just as good a job?',
        usageFrequency: 'How often do you book this kind of appointment?',
        finishExisting: {
          label: 'Has it been a while since your last one?',
          phrases: ['you had one recently', "it's been a while since your last one"],
          signal: 'Time since last one',
        },
      },
    },
  ],

  // Polarity — necessity: higher is better · financing: cash is best ·
  // longTermCost: yes (lower costs) is best · duplicate: YES is bad.
  auto: [
    {
      id: 'car',
      keywords: [
        'car', 'vehicle', 'sedan', 'suv', 'hatchback', 'estate', 'coupe', 'convertible', 'van',
        'truck', 'pickup', 'tesla', 'bmw', 'audi', 'mercedes', 'volkswagen', 'vw', 'toyota',
        'honda', 'ford', 'porsche', 'volvo', 'skoda', 'electric car', 'ev', 'hybrid',
      ],
      item: 'this car',
      questions: {
        necessity: 'How much do you need a car day to day? (1 = transit works fine, 5 = no way around it)',
        longTermCost: 'Compared with now, will fuel, insurance and repairs cost you less?',
        duplicate: 'Do you already have a car that gets you where you need to go?',
      },
    },
    {
      id: 'motorbike',
      keywords: ['motorbike', 'motorcycle', 'scooter', 'moped', 'vespa'],
      item: 'this bike',
      questions: {
        necessity: 'How much will it replace trips you pay for now? (1 = hardly, 5 = most of them)',
        longTermCost: 'Will it cost less than how you get around now?',
        duplicate: 'Do you already own a vehicle that covers these trips?',
      },
    },
    {
      id: 'part',
      keywords: [
        'tyre', 'tire', 'wheel', 'alloy', 'car battery', 'brake', 'exhaust', 'roof rack',
        'tow bar', 'dash cam', 'car stereo', 'car seat', 'child seat', 'engine', 'gearbox',
        'windscreen', 'number plate', 'charging cable', 'wallbox',
      ],
      item: 'this part',
      questions: {
        necessity: 'Is it a safety or legal must, or an upgrade? (1 = upgrade, 5 = must)',
        longTermCost: 'Will it save you money later (fuel, repairs, fines)?',
        duplicate: 'Does your car already have something that does this job?',
      },
    },
  ],

  // Polarity — timeForIt: more is better · existingCollection: less is better ·
  // learningCurve: definitely is best · resaleValue: yes is good.
  hobby: [
    {
      id: 'instrument',
      keywords: [
        'guitar', 'bass guitar', 'piano', 'keyboard instrument', 'drum', 'violin', 'ukulele',
        'synthesizer', 'synth', 'amplifier', 'amp', 'pedal', 'instrument',
      ],
      item: 'this instrument',
      questions: {
        timeForIt: 'Realistic hours a week you’ll practise?',
        existingCollection: 'How many instruments or bits of gear do you already own?',
        learningCurve: 'Will you push through the months of practice before it sounds good?',
        resaleValue: 'Could you resell this instrument for a fair price if it doesn’t stick?',
      },
    },
    {
      id: 'collectible',
      keywords: [
        'lego', 'model kit', 'figurine', 'collectible', 'trading card', 'pokemon card', 'comic',
        'manga', 'vinyl',
      ],
      item: 'this collectible',
      questions: {
        timeForIt: 'Realistic hours a week you’ll spend building, reading or enjoying it?',
        existingCollection: 'How much of your collection is still unopened or unread?',
        learningCurve: {
          label: 'Will you actually build, read or display it, not just store it?',
          phrases: ["it'll probably end up in a box", "you'll actually enjoy it, not just store it"],
          signal: 'Will actually enjoy it',
        },
      },
    },
    {
      id: 'book',
      keywords: ['book', 'novel'],
      item: 'this book',
      questions: {
        timeForIt: 'Realistic hours a week you have for reading?',
        existingCollection: "How many books do you own that you haven't read yet?",
        learningCurve: {
          label: 'Will you finish it, rather than stop halfway?',
          phrases: ["you doubt you'll finish it", "you'll actually finish it"],
          signal: 'Will finish it',
        },
        resaleValue: {
          label: 'Is it hard to borrow from a library or a friend?',
          phrases: ['you could borrow it instead', "it isn't easy to borrow"],
          signal: 'Hard to borrow',
        },
      },
    },
    {
      id: 'game',
      keywords: ['board game', 'boardgame', 'jigsaw', 'puzzle', 'chess'],
      item: 'this game',
      questions: {
        timeForIt: 'Realistic hours a week you’ll play it?',
        existingCollection: 'How many games do you own that rarely get played?',
        learningCurve: {
          label: 'Do you have people who’ll actually play it with you?',
          phrases: ["you don't have anyone to play it with", 'you have people to play it with'],
          signal: 'People to play with',
        },
      },
    },
    {
      id: 'outdoor',
      keywords: [
        'tent', 'camping', 'sleeping bag', 'hiking', 'backpacking', 'rucksack', 'fishing rod',
        'tackle', 'telescope', 'binocular',
      ],
      item: 'this gear',
      questions: {
        timeForIt: 'Realistic hours a week you’ll spend out using it?',
        existingCollection: 'How much outdoor gear do you already own?',
        learningCurve: {
          label: "Have you done this enough to know you'll keep at it?",
          phrases: ["you're not sure you'll keep at it", "you know you'll keep at it"],
          signal: "You'll keep at it",
        },
        resaleValue: {
          label: 'Is this gear hard to rent or borrow?',
          phrases: ['you could rent or borrow it instead', "it isn't easy to rent or borrow"],
          signal: 'Hard to rent or borrow',
        },
      },
    },
    {
      id: 'craft',
      keywords: [
        'paint set', 'acrylic', 'watercolour', 'watercolor', 'canvas', 'sketchbook', 'easel',
        'brush set', 'clay', 'pottery', 'knitting', 'crochet', 'yarn', 'sewing machine',
        'embroidery',
      ],
      item: 'this kit',
      questions: {
        existingCollection: 'How many unused craft supplies do you already have?',
        learningCurve: 'Will you stick with it past the first few projects?',
      },
    },
  ],

  // Polarity — occasion: gift / party are best · frequency: rarely is best ·
  // alternatives: YES is bad · impulse: YES is bad.
  alcohol: [
    {
      id: 'wine',
      keywords: [
        'wine', 'red wine', 'white wine', 'rose wine', 'champagne', 'prosecco', 'cava',
        'sparkling wine', 'bottle of wine',
      ],
      item: 'this wine',
      questions: {
        alternatives: 'Is there a cheaper wine that would do just as well?',
      },
    },
    {
      id: 'spirits',
      keywords: [
        'whisky', 'whiskey', 'scotch', 'bourbon', 'rye', 'vodka', 'gin', 'rum', 'tequila',
        'mezcal', 'brandy', 'cognac', 'liqueur', 'aperol', 'campari', 'vermouth', 'absinthe',
        'schnapps', 'jagermeister', 'baileys',
      ],
      item: 'this bottle',
      questions: {
        alternatives: 'Is there a cheaper bottle that would taste nearly as good to you?',
      },
    },
    {
      id: 'beer',
      keywords: [
        'beer', 'lager', 'ale', 'ipa', 'stout', 'pilsner', 'craft beer', 'cider', 'six pack', 'keg',
      ],
      item: 'this beer',
      questions: {
        alternatives: 'Is there a cheaper beer you’d enjoy just as much?',
      },
    },
    {
      id: 'night-out',
      keywords: ['bar tab', 'cocktail'],
      item: 'this round',
      questions: {
        occasion: "What's the night out for?",
        alternatives: 'Is there a cheaper bar or drink that would be just as fun?',
      },
    },
  ],

  // Polarity — budgetSet: yes is good · lastResult: broke even / won small are
  // neutral, lost is worst · mood: pure fun is best · canAffordLoss: higher is better.
  gambling: [
    {
      id: 'lottery',
      keywords: [
        'lottery', 'lottery ticket', 'lotto', 'scratch card', 'scratchcard', 'euromillion', 'raffle',
      ],
      item: 'this ticket',
      questions: {
        budgetSet: 'Do you have a fixed amount you spend on tickets each month?',
        lastResult: 'How did your last tickets do?',
        mood: 'Why are you buying this ticket now?',
        canAffordLoss: 'Can you treat this ticket money as already gone? (1 = no way, 5 = easily)',
      },
    },
    {
      id: 'sports-bet',
      keywords: [
        'bet', 'betting', 'sports bet', 'sportsbook', 'bookmaker', 'bookie', 'odds',
        'accumulator', 'parlay', 'wager', 'horse racing', 'greyhound', 'fantasy league',
        'bet365', 'draftking',
      ],
      item: 'this bet',
      questions: {
        budgetSet: 'Do you have a strict weekly limit for betting?',
        lastResult: 'How did your last bet go?',
        mood: 'Why are you placing this bet now?',
        canAffordLoss: 'If this bet loses, can you shrug it off? (1 = no way, 5 = easily)',
      },
    },
    {
      id: 'casino',
      keywords: [
        'casino', 'slot machine', 'slot', 'roulette', 'blackjack', 'poker', 'poker chip',
        'baccarat', 'craps', 'bingo', 'stake',
      ],
      item: 'this session',
      questions: {
        budgetSet: "Have you set a hard limit you'll walk away at?",
        lastResult: 'How did your last session go?',
        mood: 'Why are you playing now?',
        canAffordLoss: 'Can you afford to lose everything you bring tonight? (1 = no way, 5 = easily)',
      },
    },
    {
      id: 'loot-box',
      keywords: ['loot box', 'lootbox', 'gacha', 'skin gambling'],
      item: 'this purchase',
      questions: {
        budgetSet: 'Do you have a monthly cap on in-game spending?',
        lastResult: 'How did your last pulls go?',
        mood: 'Why are you buying pulls right now?',
      },
    },
  ],

  // Polarity — quitting: yes is best, never smoked worst · frequency: rarely is
  // best · monthlyCost: yes is good · healthAware: yes is good.
  vape: [
    {
      id: 'disposable',
      keywords: ['disposable vape', 'elf bar', 'elfbar', 'lost mary', 'geek bar'],
      item: 'this disposable',
      questions: {
        frequency: 'How often will you reach for it?',
        monthlyCost: 'Have you worked out what disposables cost you each month?',
      },
    },
    {
      id: 'vape-kit',
      keywords: [
        'vape', 'vaping', 'vape pen', 'vape kit', 'vape juice', 'e liquid', 'eliquid', 'e juice',
        'ejuice', 'pod', 'pod kit', 'juul', 'smok', 'vaporesso', 'aspire', 'voopoo', 'coil',
        'atomizer', 'tank', 'mod', 'box mod',
      ],
      item: 'this vape',
      questions: {
        monthlyCost: 'Have you added up what coils, pods and liquid cost each month?',
      },
    },
    {
      id: 'nicotine-alternative',
      keywords: ['nicotine pouch', 'snus', 'heated tobacco', 'iqos'],
      item: 'this',
      questions: {
        quitting: 'Are you using this to move off regular cigarettes?',
      },
    },
  ],

  other: [],
}
