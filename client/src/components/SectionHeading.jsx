// function SectionHeading({ icon: Icon, children }) {
//   return (
//     <h3 className="section-heading">
//       <span className="section-chip">
//         <Icon size={16} aria-hidden="true" />
//       </span>
//       {children}
//     </h3>
//   )
// }

// export default SectionHeading

function SectionHeading({ children }) {
  return <h3 className="section-heading">{children}</h3>
}

export default SectionHeading