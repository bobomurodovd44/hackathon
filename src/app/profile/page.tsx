import { Metadata } from 'next'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Shield, Settings, Bell, Globe, MapPin, Camera, Sparkles, ChevronRight, CheckCircle2 } from "lucide-react"

export const metadata: Metadata = {
  title: 'My Identity',
  description: 'National and international identity management',
}

export default function ProfilePage() {
  return (
    <div className="relative min-h-screen bg-transparent overflow-x-hidden pb-32">
      {/* Decorative backdrop shapes to avoid flat backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] md:w-[800px] h-[800px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[80px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-6 py-12 md:py-20 relative z-10">
        
        {/* Header Section */}
        <header className="mb-16 md:mb-24 flex flex-col md:flex-row justify-between items-start md:items-end gap-8 animate-in slide-in-from-bottom-10 fade-in duration-700">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight font-heading leading-tight text-foreground dark:text-foreground">
              Identity &<br/> Permissions.
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light leading-relaxed">
              Verify your digital footprint. Manage how the world sees you.
            </p>
          </div>
          <div className="hidden md:flex bg-background/40 backdrop-blur-xl border border-border rounded-full p-2 items-center space-x-2 shadow-2xl">
              <span className="flex h-3 w-3 relative ml-3">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="pr-4 font-semibold text-sm tracking-wide">SYSTEMS ONLINE</span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* Identity Showcase */}
            <section className="group relative bg-card/60 hover:bg-card/80 backdrop-blur-2xl border border-border rounded-[2.5rem] p-8 md:p-12 overflow-hidden transition-all duration-700 hover:shadow-2xl hover:-translate-y-1 animate-in slide-in-from-bottom-12 fade-in fill-mode-both" style={{ animationDelay: '100ms' }}>
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-100 transition-opacity duration-1000">
                <Sparkles className="w-32 h-32 text-primary" strokeWidth={1} />
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
                <div className="relative">
                  <div className="h-32 w-32 md:h-40 md:w-40 rounded-[2rem] bg-gradient-to-br from-primary to-accent border-4 border-background/50 overflow-hidden shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 flex items-center justify-center text-primary-foreground text-5xl font-heading font-black">
                    ИФ
                  </div>
                  <button className="absolute -bottom-3 -right-3 p-3 bg-background border border-border text-foreground rounded-2xl hover:scale-110 transition-transform active:scale-95 shadow-xl">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-3 text-center md:text-left mt-4 md:mt-0">
                  <h2 className="text-4xl font-heading font-bold text-foreground">Иван Фёдоров</h2>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="inline-flex items-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-sm font-semibold border border-emerald-500/20">
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      Verified Citizen
                    </span>
                    <span className="inline-flex items-center rounded-xl bg-primary/10 text-primary px-3 py-1 text-sm font-semibold border border-primary/20">
                      Trust Level: Tier 1
                    </span>
                  </div>
                  <p className="text-muted-foreground pt-2 max-w-sm text-lg leading-relaxed mix-blend-luminosity">
                    Digital passport verified via government API integration.
                  </p>
                </div>
              </div>
            </section>

            {/* Crucial Data Forms */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-bottom-16 fade-in fill-mode-both" style={{ animationDelay: '200ms' }}>
              
              {/* Form Col 1 */}
              <div className="space-y-8">
                <div className="space-y-6 bg-card/40 backdrop-blur-xl rounded-[2rem] p-8 border border-border relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors" />
                  <div>
                    <h3 className="text-2xl font-heading font-bold mb-1 flex items-center">
                      <User className="w-5 h-5 mr-3 text-primary" /> Vital Info
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium">Legal name and citizenship.</p>
                  </div>
                  <div className="space-y-5">
                    <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">First Name</Label>
                       <Input className="h-14 bg-background/50 border-border rounded-xl text-lg font-medium focus-visible:ring-primary focus-visible:ring-offset-2" defaultValue="Иван" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Last Name</Label>
                       <Input className="h-14 bg-background/50 border-border rounded-xl text-lg font-medium focus-visible:ring-primary focus-visible:ring-offset-2" defaultValue="Фёдоров" />
                    </div>
                     <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Citizenship</Label>
                       <Input className="h-14 bg-background/50 border-border rounded-xl text-lg font-medium focus-visible:ring-primary focus-visible:ring-offset-2" defaultValue="Узбекистан" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Col 2 */}
              <div className="space-y-8 mt-12 md:mt-0">
                <div className="space-y-6 bg-card/40 backdrop-blur-xl rounded-[2rem] p-8 border border-border relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                  <div>
                    <h3 className="text-2xl font-heading font-bold mb-1 flex items-center">
                      <Globe className="w-5 h-5 mr-3 text-secondary-foreground" /> Endpoints
                    </h3>
                    <p className="text-muted-foreground text-sm font-medium">Where the system reaches you.</p>
                  </div>
                   <div className="space-y-5">
                    <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Primary Protocol (Phone)</Label>
                       <Input className="h-14 bg-background/50 border-border rounded-xl text-lg font-medium focus-visible:ring-primary focus-visible:ring-offset-2" defaultValue="+998 90 123 45 67" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Digital Route (Email)</Label>
                       <Input className="h-14 bg-background/50 border-border rounded-xl text-lg font-medium focus-visible:ring-primary focus-visible:ring-offset-2" defaultValue="ivan.fedorov@gov.uz.id" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold">Physical Node (Address)</Label>
                       <Input className="h-14 bg-background/50 border-border rounded-xl text-lg font-medium focus-visible:ring-primary focus-visible:ring-offset-2" defaultValue="Sector 7G, Tashkent" />
                    </div>
                  </div>
                </div>
              </div>

            </section>
            
            <div className="flex justify-end pt-8 animate-in slide-in-from-bottom-12 fade-in fill-mode-both" style={{ animationDelay: '300ms' }}>
               <Button size="lg" className="h-16 px-10 rounded-full text-lg font-semibold shadow-[0_0_40px_-10px_var(--color-primary)] hover:shadow-[0_0_60px_-5px_var(--color-primary)] transition-all bg-primary text-primary-foreground hover:bg-primary/90">
                 Commit Changes
                 <ChevronRight className="ml-3 w-6 h-6 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
               </Button>
            </div>

          </div>

          {/* Sticky Context Sidebar */}
           <div className="lg:col-span-4 lg:pl-10 animate-in slide-in-from-right-16 fade-in fill-mode-both" style={{ animationDelay: '400ms' }}>
              <div className="sticky top-12 space-y-8">
                 
                 <div className="bg-background/60 backdrop-blur-2xl border border-border rounded-[2rem] p-8 shadow-2xl">
                   <h4 className="font-heading text-2xl font-bold mb-6 tracking-tight">Security Level</h4>
                   <div className="h-4 w-full bg-card rounded-full overflow-hidden mb-4 border border-border">
                     <div className="h-full w-[85%] rounded-full relative bg-gradient-to-r from-emerald-500 to-primary">
                     </div>
                   </div>
                   <div className="flex justify-between text-base font-bold">
                     <span className="text-muted-foreground">Optimal Status</span>
                     <span className="text-emerald-500">85%</span>
                   </div>
                   <p className="text-sm text-muted-foreground mt-6 leading-relaxed font-medium">
                     Your account passes ISO 27001 recommendations. Consider adding a hardware security key for maximum clearance.
                   </p>
                 </div>

                 <div className="flex flex-col space-y-4">
                    <button className="flex items-center justify-between p-6 rounded-[2rem] bg-card/30 hover:bg-card/80 border border-transparent hover:border-border transition-all duration-300 group backdrop-blur-xl">
                       <div className="flex items-center font-bold text-lg font-heading">
                          <Shield className="w-6 h-6 mr-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          Authentication
                       </div>
                       <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all text-primary" />
                    </button>
                    <button className="flex items-center justify-between p-6 rounded-[2rem] bg-card/30 hover:bg-card/80 border border-transparent hover:border-border transition-all duration-300 group backdrop-blur-xl">
                       <div className="flex items-center font-bold text-lg font-heading">
                          <Globe className="w-6 h-6 mr-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          Data Portability
                       </div>
                       <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all text-primary" />
                    </button>
                    <button className="flex items-center justify-between p-6 rounded-[2rem] bg-destructive/5 hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all duration-300 group backdrop-blur-xl">
                       <div className="flex items-center font-bold text-lg font-heading text-destructive/80">
                          <Settings className="w-6 h-6 mr-5 text-destructive/70 group-hover:text-destructive transition-colors" />
                          Danger Zone
                       </div>
                       <ChevronRight className="w-6 h-6 opacity-0 group-hover:opacity-100 -translate-x-3 group-hover:translate-x-0 transition-all text-destructive" />
                    </button>
                 </div>

              </div>
           </div>

        </div>
      </div>
    </div>
  )
}
