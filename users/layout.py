from crispy_forms.layout import TEMPLATE_PACK, LayoutObject


class TagDiv(LayoutObject):
    """
    Layout object that wraps field(s) in a div with a specified HTML tag.

    This class provides a way to wrap fields in a div with a specific tag
    attribute that can be referenced in templates.
    """
    template = "%s/layout/div.html"

    def __init__(
        self, *fields, tag='div', css_class=None, css_id=None, **kwargs
    ):
        self.fields = list(fields)
        self.tag = tag
        self.css_class = css_class
        self.css_id = css_id
        self.attrs = {}
        self.attrs.update(kwargs)

    def render(
        self, form, form_style, context, template_pack=TEMPLATE_PACK, **kwargs
    ):
        fields = (
            self.get_rendered_fields(
                form, form_style, context, template_pack, **kwargs
            )
        )

        template = self.get_template_name(template_pack)

        # Add the tag to the context so it can be used in the template
        context.update({
            'tag': self.tag,
            'div': self,
            'fields': fields
        })

        return self.get_rendered_template(template, context, template_pack)

    def add(self, child):
        """Add a child element to this div"""
        self.fields.append(child)
        return self
