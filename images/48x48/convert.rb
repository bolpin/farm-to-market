names = %w(
  Turnip
  Rose
  Cucumber
  Tulip
  Tomato
  Melon
  Eggplant
  Lemon
  Pineapple
  Rice
  Wheat
  Grapes
  Strawberry
  Cassava
  Potato
  Coffee
  Orange
  Avocado
  Corn
  Sunflower
)

NUM_STAGES = 6
names.each_with_index do |name, i|
  (0..5).each do |inverseStage|
    inFile = "tile" + (i*NUM_STAGES + inverseStage).to_s.rjust(3, "0") + ".png"
    outFile = name + (NUM_STAGES - 1 - inverseStage).to_s + ".png"
    cmd = "cp " + inFile + " tmp/" + outFile
    puts cmd
    system(cmd)
  end
end
