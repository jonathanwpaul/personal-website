## Rationale

My poor Ghost S1 was overheating, and I needed some extra fans. The factory top hats are pretty expensive and not quite the right size for the fans I got, soooo 3d printing to the rescue. I give you a parameterized top hat for the Ghost S1 SFFPC case. For reference, the official medium top hat is 25mm and my pictured print is 31 mm. Print two of the same part and join together.

## BOM
| Part                               | Quantity | Notes                                                                                                                  |
| ---------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| 10mm x 5mm x 2mm neodymium magnets | 4        | the ones I had on hand were 9.5x4.5x2 so you might want to test that part of the model before printing the whole thing |
| M3x10 bolt                         | 4        | in the range of 8-12 mm should, secures top hat to body through top plate                                              |
| M4x12 bolts                        | 2        |                                                                                                                        |

## Notes
- I flipped my top plate around so the lips were sticking up, which line up with these tabs:
	- ![[ghost-s1-tab.png]]
	- This helps avoid flexing in the part
- if you don't want to use magnets, delete the feature called 'magnetmounts' in the .f3d file
### Parameters
- to edit the parameters, use the .f3d file (Open in Fusion360, Modify > Change Parameters)
	- `magnetLength`: including tolerance, length of magnets
	- `magnetWidth`: including tolerance, height of magnets
	- `magnetDepth`: take a guess
	- `topHatHeight`: how tall the top hat will be
		- realistically any value, some Doug Dimmadome Ghost S1s would be fun to see :)
