## TMC CHARACTER VAULT

```
TMC CHARACTER CREATION VAULT
Next.js (Vercel) + Supabase (database) + dynamic routes. this is a independent module for a even larger proyect
```
## Storage Authorization + Payment Onboarding (MVP)

## Implementation Plan

```
Ver 0.5 this 

### 1. Executive summary

This document defines the firts version of a module for Character Creation and management using the systems of the TMC Roleplay. the idea is that this module can be improved to the point the character creation and viewe can be accessed on mobile and desktop. reason why we are making it on next.js and using supabase as the database.  the principal objetive is making a character creation tool with a sidebar that allows to add text. images, separators and event re arrange the sections of the character sheet. the character sheet will be displayed on the main area of the screen. it would be something like elementor or divi, a builder where users can click or drag and drop elements into the character sheets. add a background gif or image, change the color of text and even resize the image of the blaze. and every character should have its unique link to be shared with other users. and can be accesed without being logged in

we are going to have an auth system using supabase auth. this will allow users to login and create characters.  and also to login in another chat module to use said characters (reason why we are going to have a profile image on top of the page) that is going to be the character profile image on the chat. 

the overall look and feel of the app should be of a sci-fi academy.


### 2. Deliverables

#### 2.1 In scope (v 0.1) - DONE!

```
● Character sheet stylish and customizable display.
● Supabase auth for login and character creation.
● Login Page (Root)
● Register Page (Root)
● Character Creation Page
● Character View Page
● Character Edit Page
● Character Delete Page
● Character List Page
● Character Search Page
● Character Filter Page
● Character Sort Page
● Character Pagination Page
● Add a search bar to search characters by name,  battlefront, etc.
● Add a filter to filter characters by battlefront etc.
● Add a sort to sort characters by name etc.
● Add a pagination to paginate characters
● Implementation of PDF Export of the character sheet
● add responsive design for mobile and desktop
● make the image of blaze resizable and the borders optional
● Style Adjustments


```
#### 2.2 V 1.1 (To be researched)

● Roles and permissions system
● Add Professors Sections
● Desktop integration with electron
● Mobile app integration with react native
● Integration with discord bot like tupperbox
● Add own characters management screen
● Automatic character creation from discord bot
● Connection with the main chat module and also added a small banner with relevant data (health, mana, etc)
● Effects and more styles for a better more modern academia look
● Add an import system for characters (and maybe a needed csv export)


### 3. Key design decisions

**3.1 Look & Feel**

```
● The app should have a sci-fi academy look and feel.
● The app should be responsive for mobile and desktop.
● The app should have a dark mode.
● The app should have a light mode.
● The app should have a system theme.
● Color Palette should have white and blue as primary colors for the light mode and black and blue on the dark mode. also shoudl follow color harmony and look professional
● The app should have a clean and modern interface.
● The app should have a intuitive and easy to use interface. and shoulnd feel full of information.


```

We should use tailwind for the styling.

**3.2 Stores and global states.**

Stores: we are going to use zustand for store and global state management.

### 4. End-to-end workflow

## Step 0 Account Creation

```
1. User goes to the login page.
2. User clicks on the register button.
3. User fills in the registration form.
4. User clicks on the register button.
5. User is redirected to the login page.
6. User logs in.
7. User is redirected to the search page.
```

## Step 1 Character Creation

there should be a sidebar menu for the logged user where he can see the pages. but also a small button en the bottom right corner that allows to create a new character. this button should be visible on all pages except character creation or edit page, the login and register pages. and should have a cool animation when clicked. 

```

1. User goes to the character creation page.
2. User fills in the character creation form , adds elements and make his character sheet.
3. User clicks on the create character button.
4. User is redirected to the character view page.
```

## Step 2 Character View

```
1. User goes to the character view page.
2. User can see the character sheet.
3. User can edit the character sheet.
4. User can delete the character sheet.
5. User can share the character sheet.
```

## Step 3 Character Edit

```
1. User goes to the character edit page.
2. User can edit the character sheet.
3. User clicks on the save character button.
4. User is redirected to the character view page.
```

## Step 4 Character Delete

```
1. User goes to the character delete page.
2. User clicks on the delete character button.
3. User is redirected to the character view page.
```

## Step 5 Character Share

```
1. User goes to the character share page.
2. User can share the character sheet.
3. User clicks on the share character button.
4. User is redirected to the character view page.
```

## Step 6 Character List

```
1. User goes to the character list page.
2. User can see the character list.
3. User can edit the character sheet.
4. User can delete the character sheet.
5. User can share the character sheet.
```

## Step 7 Character Search

```
1. User goes to the character search page.
2. User can search the character sheet.
3. User can edit the character sheet.
4. User can delete the character sheet.
5. User can share the character sheet.
```

## Step 8 Character Filter

```
1. User goes to the character filter page.
2. User can filter the character sheet.
3. User can edit the character sheet.
4. User can delete the character sheet.
5. User can share the character sheet.
```

## Step 9 Character Sort

```
1. User goes to the character sort page.
2. User can sort the character sheet.
3. User can edit the character sheet.
4. User can delete the character sheet.
5. User can share the character sheet.
```

## Step 10 Character Pagination

```
1. User goes to the character pagination page.
2. User can paginate the character sheet.
3. User can edit the character sheet.
4. User can delete the character sheet.
5. User can share the character sheet.
```

## Step 11 Character Export

```
1. User goes to the character export page.
2. User can export the character sheet.
3. User clicks on the export character button.
4. User is redirected to the character view page.
```
