Reactive state for Webix Jet apps
====

## Why it is necessary

Webix Jet provides two ways to cross-view communication

- events
- view parameters, 

Reactive state provides a combination of both, with ability to maintain state ( as parameters ) and ability without predefined source/target ( as events ) 

## How to use

```js
import { createState, link } from "jet-restate";
...
const state = createState({
    mode: config.mode || "grid",
    selectedItem: [],
    search: "",
    path: config.path || "/",
    clipboard: null,
});

this.show("child", { target:"left", params: { state }})
this.show("child", { target:"right", params: { state }})
```

now in any of child views

```js
    const state = this.getParam("state");
    //change state
    state.mode = newValue;
    //react on state changes
    this.on(state.$changes, "mode", value => {
        this.getRoot().setValue(value);
    });
```

#### Extending state

It possible to add new vars to the state.
There is no way to remove them though.

```js
const state = createState({ mode:"grid" });
state.$extend({ path:"/" })
```