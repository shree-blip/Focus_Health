import { motion } from 'framer-motion';

/**
 * BuildFundOperateLoop - shared circular animation for Build / Fund / Operate
 * Used in homepage hero and Platform page for perfect visual consistency
 */
export function BuildFundOperateLoop() {
  return (
    <div className="relative w-[384px] h-[384px] mx-auto">
      {/* Orbiting elements */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-5 h-5 -ml-2.5 -mt-2.5"
          animate={{ rotate: 360 }}
          transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "2.5px 160px" }}
        >
          <motion.div
            className={`w-5 h-5 rounded-full ${i % 2 === 0 ? 'bg-secondary/80 shadow-lg shadow-secondary/40' : 'bg-accent/80 shadow-lg shadow-accent/40'}`}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, delay: i * 0.5, repeat: Infinity }}
          />
        </motion.div>
      ))}

      {/* Circular track */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 384 384">
        <circle cx="192" cy="192" r="160" fill="none" stroke="hsl(var(--primary) / 0.15)" strokeWidth="2" strokeDasharray="10 5" />
        <circle cx="192" cy="192" r="130" fill="none" stroke="hsl(var(--accent) / 0.1)" strokeWidth="1" strokeDasharray="6 4" />
      </svg>

      {/* Floating labels */}
      {[
        { label: "Build", angle: -30 },
        { label: "Fund", angle: 90 },
        { label: "Operate", angle: 210 },
      ].map((item, i) => {
        const radians = (item.angle * Math.PI) / 180;
        const x = 192 + 175 * Math.cos(radians);
        const y = 192 + 175 * Math.sin(radians);
        return (
          <motion.div
            key={item.label}
            className="absolute text-xs font-semibold text-primary bg-card/90 backdrop-blur-md px-4 py-2 rounded-full border border-border shadow-xl"
            style={{ left: x - 35, top: y - 14 }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 + i * 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.1 }}
          >
            {item.label}
          </motion.div>
        );
      })}
    </div>
  );
}
