export default {
    name: "TableRenderHeader",
    functional: true,
    props: {
        render: Function,
        row: Object,
        index: Number,
    },
    render: (h, ctx) => {
        const params = {
            row: ctx.props.row,
            index: ctx.props.index,
        }

        const cb = ctx.props.render(h, params)

        return typeof cb === "object"
            ? cb
            : h("div", {
                  domProps: {
                      innerHTML: cb,
                  },
              })
    },
}
