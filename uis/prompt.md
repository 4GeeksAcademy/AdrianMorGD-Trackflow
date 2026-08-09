[DESIGN]

# Visual UI Style: Neo-Minimalism
    - Clean layout
    - Card based sections
    - Soft shadows
    - Lots of breathing room
    - Huge photography
    
## Graphics
    - Radial dot gradient pattern (SVG)
## Color Palette
Follow the color proportion below:
- 60% Background Color
    - White
- 30% Secondary Color
To divide sections clearly on the background
    - Black
- Accent/Primary Color
Reserved for Primary CTA and Secondary CTA buttons, and to signal actionable components
    - Neon Green Mint #00f49c 
- Neutral Colors
Reserved for components that do not need to stand out such as selects, checkboxes, input fields,etc.
    - White Grays

## Fonts
    - geometric sans serif
    - bold headings
    - generous line spacing
    - short line lengths
# Content Requirements
    - Use font awesome for icons
    - Use googlefonts for fonts
    - Use free stock images
    - Use free stock vector files if needed


[REQUIREMENTS]
- Mobile first: web responsive approach
- Use semantic tags best practices
- Use Tailwind CSS v4 for all stylying no other front-end frameworks
- Follow best SEO practices: schema.org
- Folow best SEO practices: meta name description and title
- Implement accessibility best practices: ARIA ATTRIBUTES where needed
- Add descriptive clear comments to each block of code



[MOBILEFIRSTBASEBREAKPOINT]

# HEADER

# # TOP NAV MENU
- top left aligned logo place holder
- top right aligned burger menu

# MAIN

## HERO SECTION
-  2 line h1 text: Smarter Fulfillment for Growing E-commerce Brands
    - Placed over hero image
- Hero image: placeholder image 
    - No rounded borders
    - Full width: bleeds to left and right margins
    - Image Fully Extends top to the top nav
    - Black Scrim over image to enhance readibility of hero text
    - Centered CTA full border radius with text Get a Spot Quote

## IMPACT METRICS SECTION

- h2 with text Reliable Fulfillment for Every Order, Every Time
- p1 with placeholder text

- Impact card 1
 - Placeholder image full border radius
 - Below image a h4 left aligned text +400
 -  p Warehouses across US
 - Secondary button Learn more

 - Impact card 2
 - Placeholder image full border radius
 - Below image a h4 left aligned text +50k
 - p Shipments Delivered Successfully
 - Secondary button Learn more

 
 - Impact card 3
 - Placeholder image full border radius
 - Below image a h4 left aligned text 98.7%
 -  p On Time Delivery Rate
 - Secondary button Learn more



## WHY CHOOSE US SECTION

- h2 centered Flexible capacity on demand

- p text We have one of the world’s largest networks of independent shippers source the right truck for each load and drivers find loads that fit their schedules. Finding the optimal transportation solution is a seamless experience.

- Primary CTA button Get a Spot Quote

- Delivery tracking image rounded borders


## FOOTER
- Black bg
- Logo left aligned
- Flex row: Facebook logo, Twitter logo and Instagram logo


# PAGE Get a Quote
- New html page linked by get a quote CAT 
- Full width background stock image related to tracking
- Get a quote container
    - black color transparent background blur White border
    - Horizontal and Vertical centered, rounded corners
    - h1 Get a Quote
    - p Unlock your full delivery potential and get to know us
    - Form fields
    Flex column
        - Email input
            - no visible label only placeholder text Email
        - Label Phone number
        - Phone number fields
        Aligned with flex row
            - Phone Area code select
                -Select Options
                    - Default: US FLAG icon text +84
                    - Spain: SPAIN FLAG icon text +69
                    - Mexico: Mexico Flag icon text +52
            - Phone number text input
                - Place holder numbers
                - Only numbers allowed validation
                - Entering letters or special characters shows error caption text in red below field
                    - Error message: Please enter a valid phone number  
    - Get started cta primary color



[MD:BREAKPOINT]

# HEADER

# # TOP NAV MENU
- top left aligned logo place holder
- Nav Item Get a Quote top right corner linked to get a quote html

# MAIN

## HERO SECTION-->CHANGES
-  Text REM scales for breakpoint
- CTA Grows to medium size

## IMPACT METRICS SECTION --->CHANGES
-  Text REM scales for breakpoint
- CTA Grows to medium size

- h2 full width line
- p1 with placeholder text

Impact cards
- Flex row 
- All cards go full width to fit 3 columns
- p minimmum height to keep same height on learn more buttons consistent

## WHY CHOOSE US SECTION--> CHANGES
-  Text REM scales for breakpoint
- CTA Grows to medium size

- p text full width

## FOOTER-->CHANGES
-  Text REM scales for breakpoint
- Icons grow to medium size


# PAGE Get a Quote
- NO CHANGES


[LANDXL:BREAKPOINTS]

# HEADER

# # TOP NAV MENU-->NO CHANGES


# MAIN

## HERO SECTION-->CHANGES
-  Text REM scales for breakpoint
- CTA Grows to large size

## IMPACT METRICS SECTION --->CHANGES
-  Text REM scales for breakpoint
- CTA Grows to largesize

- h2 full width line
- p1 full width


## WHY CHOOSE US SECTION--> CHANGES
-  Text REM scales for breakpoint
- CTA Grows to large size

- p text full width

## FOOTER-->CHANGES
-  Text REM scales for breakpoint


# PAGE Get a Quote
- NO CHANGES