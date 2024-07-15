# Roadmap v0.15

✅  Deprecate and remove legacy getElementIDMap & enableOnRemovedFromDOM (replace enableOnRemovedFromDOM by including in mutationTracker if specified by TagFunctionOptions)
✅  Deprecate/remove `document` from TagCreationOptions (can be passed to tag() via TagFunctionOptions)
✅  Remove references to global `document` (pass in via TagFunctionOptions?)
✅  Re-implement .ids to avoid constantly running querySelectorAll on every de-reference

# Pending

* Add option to TagFunctionOptions, allowing alternative attributes for `id` to prevent re-use errors. Need to consider `when('#id')`, `this.ids...`, whether to call setAttribute() and map legacy defintions.
* Correct ExendedTagFunction so it rejects extra fields in the definition
